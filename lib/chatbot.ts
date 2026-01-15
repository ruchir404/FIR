import { createFIR } from "./fir"
import { LANGUAGES, LanguageCode, getTranslation } from "./languages"
import { ChatMessage, ChatSession, ComplaintData } from "./types"
import { bnsSuggestionService } from "./bns-suggestions"
import { geocodeAddressOSM, findNearestPoliceStationOSM } from "./location"

const CHAT_STEPS = {
  GREETING: "greeting",
  NAME: "name",
  PHONE: "phone",
  ADDRESS: "address",
  FATHER_HUSBAND: "father_husband",
  DOB: "dob",
  NATIONALITY: "nationality",
  OCCUPATION: "occupation",

  DISTRICT: "district",
  YEAR: "year",
  FIR_NUMBER: "fir_number",
  INFORMATION_TYPE: "information_type",
  DIRECTION_FROM_PS: "direction_from_ps",
  BEAT_NUMBER: "beat_number",
  DELAY_REASON: "delay_reason",
  STOLEN_PROPERTIES: "stolen_properties",

  LOCATION: "location",
  CONFIRM_POLICE_STATION: "confirm_police_station",
  EDIT_POLICE_STATION: "edit_police_station",

  INCIDENT_TYPE: "incident_type",
  DATE_TIME: "date_time",
  DESCRIPTION: "description",
  BNS_SUGGESTION: "bns_suggestion",

  PRIORITY: "priority",
  EDIT_CONFIRMATION: "edit_confirmation",
  EDIT_SELECTION: "edit_selection",

  COMPLETED: "completed",
}

const INCIDENT_TYPES = [
  "Theft",
  "Robbery",
  "Burglary",
  "Assault",
  "Domestic Violence",
  "Fraud",
  "Cybercrime",
  "Drug Offense",
  "Traffic Violation",
  "Vandalism",
  "Missing Person",
  "Rape",
  "Kidnap",
  "Child Marriage",
  "Other",
]

export class ChatbotService {
  private sessions: Map<string, ChatSession> = new Map()

  createSession(): ChatSession {
    const id = Date.now().toString()
    const session: ChatSession = {
      id,
      messages: [],
      currentStep: CHAT_STEPS.GREETING,
      collectedData: {}, // police/admin session
      isCompleted: false,
      createdAt: new Date().toISOString(),
      language: undefined,
    }

    this.sessions.set(id, session)

    this.addBotMessage(
      session,
      "Please select your preferred language:\n1. English\n2. हिंदी (Hindi)\n3. मराठी (Marathi)"
    )

    return session
  }

  public getCompletedComplaints(): ChatSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isCompleted)
  }

  async processMessage(sessionId: string, userMessage: string): Promise<ChatMessage[]> {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Session not found")

    this.addUserMessage(session, userMessage)
    const reply = await this.processStep(session, userMessage.trim())
    this.addBotMessage(session, reply)

    return session.messages
  }

  private async processStep(session: ChatSession, userInput: string): Promise<string> {
    const data = session.collectedData as ComplaintData
    const lang = session.language

    // 🌐 Language selection
    if (!lang) {
      if (userInput === "1") session.language = LANGUAGES.ENGLISH
      else if (userInput === "2") session.language = LANGUAGES.HINDI
      else if (userInput === "3") session.language = LANGUAGES.MARATHI
      else return "Please select 1, 2 or 3"

      session.currentStep = CHAT_STEPS.NAME
      return getTranslation("namePrompt", session.language)
    }

    // ================== POLICE/ADMIN FLOW ==================
    switch (session.currentStep) {
      // ----------------- BASIC INFO -----------------
      case CHAT_STEPS.NAME:
        if (!userInput || userInput.length < 2) return getTranslation("invalidInput", lang)
        data.complainantName = userInput
        session.currentStep = CHAT_STEPS.PHONE
        return getTranslation("phonePrompt", lang, { name: data.complainantName })

      case CHAT_STEPS.PHONE:
        const phoneRegex = /^(\+?\d{10,12})$/
        if (!phoneRegex.test(userInput)) return getTranslation("invalidInput", lang)
        data.complainantPhone = userInput
        session.currentStep = CHAT_STEPS.ADDRESS
        return getTranslation("addressPrompt", lang)

      case CHAT_STEPS.ADDRESS:
        if (!userInput || userInput.length < 5) return getTranslation("invalidInput", lang)
        data.complainantAddress = userInput
        session.currentStep = CHAT_STEPS.FATHER_HUSBAND
        return getTranslation("fatherHusbandPrompt", lang)

      case CHAT_STEPS.FATHER_HUSBAND:
        data.fatherHusbandName = userInput || "N/A"
        session.currentStep = CHAT_STEPS.DOB
        return getTranslation("dobPrompt", lang)

      case CHAT_STEPS.DOB:
        if (!/^\d{4}-\d{2}-\d{2}$/.test(userInput) && userInput.toUpperCase() !== "N/A")
          return getTranslation("invalidInput", lang)
        data.dateOfBirth = userInput
        session.currentStep = CHAT_STEPS.NATIONALITY
        return getTranslation("nationalityPrompt", lang)

      case CHAT_STEPS.NATIONALITY:
        if (!userInput || userInput.length < 2) return getTranslation("invalidInput", lang)
        data.nationality = userInput
        session.currentStep = CHAT_STEPS.OCCUPATION
        return getTranslation("occupationPrompt", lang)

      case CHAT_STEPS.OCCUPATION:
        if (!userInput || userInput.length < 2) return getTranslation("invalidInput", lang)
        data.occupation = userInput
        session.currentStep = CHAT_STEPS.DISTRICT
        return "Enter District:"

      // ----------------- FIR INFO -----------------
      case CHAT_STEPS.DISTRICT:
        data.district = userInput || ""
        session.currentStep = CHAT_STEPS.YEAR
        return "Enter FIR Year:"

      case CHAT_STEPS.YEAR:
        data.year = userInput || new Date().getFullYear().toString()
        session.currentStep = CHAT_STEPS.FIR_NUMBER
        return "Enter FIR Number:"

      case CHAT_STEPS.FIR_NUMBER:
        data.firNumber = userInput || ""
        session.currentStep = CHAT_STEPS.INFORMATION_TYPE
        return "Is this Written or Oral Information?"

      case CHAT_STEPS.INFORMATION_TYPE:
        data.informationType = userInput || "Written"
        session.currentStep = CHAT_STEPS.DIRECTION_FROM_PS
        return "Direction and Distance from Police Station:"

      case CHAT_STEPS.DIRECTION_FROM_PS:
        data.directionFromPS = userInput || ""
        session.currentStep = CHAT_STEPS.BEAT_NUMBER
        return "Beat Number (if known):"

      case CHAT_STEPS.BEAT_NUMBER:
        data.beatNumber = userInput || ""
        session.currentStep = CHAT_STEPS.LOCATION
        return "Enter Incident Location:"

      // ----------------- INCIDENT LOCATION -----------------
      case CHAT_STEPS.LOCATION:
        if (!userInput || userInput.length < 3) return getTranslation("invalidInput", lang)
        data.incidentLocation = userInput

        try {
          const geo = await geocodeAddressOSM(userInput)
          if (geo) {
            const station = await findNearestPoliceStationOSM(geo.lat, geo.lon)
            if (station) {
              data.policeStation = station.name
              data.autoDetectedPoliceStation = station.name
              data.policeStationLocation = `${station.lat},${station.lon}`
              if (station.district) {
                data.district = data.district || station.district
                data.autoDetectedDistrict = station.district
              }
            }
          }
        } catch (err) {
          console.error("OSM error:", err)
        }

        session.currentStep = CHAT_STEPS.CONFIRM_POLICE_STATION
        return `🚓 Police Station detected: ${data.policeStation || "Not found"}
🏢 District: ${data.district || "N/A"}

Do you want to edit Police Station?
1. Yes
2. No`

      case CHAT_STEPS.CONFIRM_POLICE_STATION:
        if (userInput === "1") {
          session.currentStep = CHAT_STEPS.EDIT_POLICE_STATION
          return "Please enter Police Station name:"
        }
        session.currentStep = CHAT_STEPS.INCIDENT_TYPE
        return INCIDENT_TYPES.map((t, i) => `${i + 1}. ${t}`).join("\n")

      case CHAT_STEPS.EDIT_POLICE_STATION:
        if (!userInput || userInput.length < 3) return getTranslation("invalidInput", lang)
        data.policeStation = userInput
        data.policeStationEdited = true
        session.currentStep = CHAT_STEPS.INCIDENT_TYPE
        return INCIDENT_TYPES.map((t, i) => `${i + 1}. ${t}`).join("\n")

      case CHAT_STEPS.INCIDENT_TYPE:
        const idx = parseInt(userInput) - 1
        if (isNaN(idx) || idx < 0 || idx >= INCIDENT_TYPES.length)
          return getTranslation("invalidInput", lang)
        data.incidentType = INCIDENT_TYPES[idx]
        session.currentStep = CHAT_STEPS.DATE_TIME
        return getTranslation("dateTimePrompt", lang)

      case CHAT_STEPS.DATE_TIME:
        if (!userInput || userInput.length < 5) return getTranslation("invalidInput", lang)
        data.incidentDateTime = userInput
        session.currentStep = CHAT_STEPS.DESCRIPTION
        return getTranslation("descriptionPrompt", lang)

      case CHAT_STEPS.DESCRIPTION:
        if (!userInput || userInput.length < 20) return getTranslation("invalidInput", lang)
        data.description = userInput
        session.currentStep = CHAT_STEPS.BNS_SUGGESTION

        const suggestions = await bnsSuggestionService.suggestBNSSections(
          data.incidentType,
          userInput,
          data.incidentLocation,
          5
        )
        data.lastBnsSuggestions = suggestions

        return (
          "Applicable BNS Sections:\n\n" +
          suggestions
            .map((s, i) => `${i + 1}. ${s.section.section_number}: ${s.section.title} (${s.confidence}%)`)
            .join("\n") +
          "\n\nSelect section numbers (comma separated)"
        )

      case CHAT_STEPS.BNS_SUGGESTION:
        const selectedSections = userInput
          .split(",")
          .map(i => parseInt(i.trim()))
          .filter(i => !isNaN(i) && i >= 1 && i <= (data.lastBnsSuggestions?.length || 0))
          .map(i => {
            const s = data.lastBnsSuggestions![i - 1].section
            return `Section ${s.section_number} - ${s.title}`
          })

        if (selectedSections.length === 0) return getTranslation("invalidInput", lang)

        data.bnsSections = selectedSections
        data.bnsSection = selectedSections[0]
        session.currentStep = CHAT_STEPS.DELAY_REASON
        return "Reason for delay in reporting (if any):"

      case CHAT_STEPS.DELAY_REASON:
        data.delayReason = userInput || ""
        session.currentStep = CHAT_STEPS.STOLEN_PROPERTIES
        return "List any properties stolen or involved (if any):"

      case CHAT_STEPS.STOLEN_PROPERTIES:
        data.stolenProperties = userInput || ""
        session.currentStep = CHAT_STEPS.PRIORITY
        return getTranslation("priorityPrompt", lang)

      case CHAT_STEPS.PRIORITY:
        if (!["1", "2", "3", "4"].includes(userInput)) return getTranslation("invalidInput", lang)
        data.priority = userInput
        session.currentStep = CHAT_STEPS.EDIT_CONFIRMATION
        return this.generateConfirmationMessage(data) + "\n\nEdit anything?\n1. Yes\n2. No"

      case CHAT_STEPS.EDIT_CONFIRMATION:
        if (userInput === "1") {
          session.currentStep = CHAT_STEPS.EDIT_SELECTION
          return `Edit:
1. Name
2. Phone
3. Address
4. Police Station
5. Incident Type
6. Description
7. Delay Reason
8. Stolen Properties`
        }

        const fir = await createFIR(data, "CHATBOT001", data.bnsSections || [])
        session.isCompleted = true
        session.createdFIRId = fir.id
        session.currentStep = CHAT_STEPS.COMPLETED
        return getTranslation("successMessage", lang)

      case CHAT_STEPS.EDIT_SELECTION:
        const editMap: Record<string, string> = {
          "1": CHAT_STEPS.NAME,
          "2": CHAT_STEPS.PHONE,
          "3": CHAT_STEPS.ADDRESS,
          "4": CHAT_STEPS.EDIT_POLICE_STATION,
          "5": CHAT_STEPS.INCIDENT_TYPE,
          "6": CHAT_STEPS.DESCRIPTION,
          "7": CHAT_STEPS.DELAY_REASON,
          "8": CHAT_STEPS.STOLEN_PROPERTIES,
        }
        if (!editMap[userInput]) return getTranslation("invalidInput", lang)
        session.currentStep = editMap[userInput]
        return "Please re-enter value:"

      case CHAT_STEPS.COMPLETED:
        return getTranslation("complaintSubmitted", lang)

      default:
        return getTranslation("invalidInput", lang)
    }
  }

  private generateConfirmationMessage(data: ComplaintData): string {
    return `Confirm FIR Details:
👤 Name: ${data.complainantName}
📞 Phone: ${data.complainantPhone}
🏢 Police Station: ${data.policeStation}
📍 District: ${data.district || "N/A"}
📍 Incident Location: ${data.incidentLocation}
📅 FIR Year: ${data.year || "N/A"}
📝 FIR Number: ${data.firNumber || "N/A"}
📰 Information Type: ${data.informationType || "Written"}
🧭 Direction from PS: ${data.directionFromPS || "N/A"}
🔢 Beat Number: ${data.beatNumber || "N/A"}
⚖️ Incident Type: ${data.incidentType}
⏰ Date & Time: ${data.incidentDateTime || "N/A"}
📝 Description: ${data.description}
⏳ Delay Reason: ${data.delayReason || "N/A"}
💰 Stolen Properties: ${data.stolenProperties || "N/A"}`
  }

  private addUserMessage(session: ChatSession, content: string) {
    session.messages.push({
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date().toISOString(),
    })
  }

  private addBotMessage(session: ChatSession, content: string) {
    session.messages.push({
      id: Date.now().toString() + "_bot",
      type: "bot",
      content,
      timestamp: new Date().toISOString(),
    })
  }
}

export const chatbotService = new ChatbotService()

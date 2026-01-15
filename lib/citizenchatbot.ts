import { createFIR } from "./fir"
import { LANGUAGES, LanguageCode, getTranslation } from "./languages"
import { ChatMessage, ChatSession, ComplaintData } from "./types"

const CITIZEN_STEPS = {
  GREETING: "greeting",
  LANGUAGE: "language",
  NAME: "name",
  PHONE: "phone",
  ADDRESS: "address",
  FATHER_HUSBAND: "father_husband",
  DOB: "dob",
  NATIONALITY: "nationality",
  OCCUPATION: "occupation",
  DISTRICT: "district",
  INCIDENT_TYPE: "incident_type",
  PRIORITY: "priority",
  DESCRIPTION: "description",
  DATETIME: "datetime",
  LOCATION: "location",
  VICTIM_DETAILS: "victim_details",
  EVIDENCE: "evidence",
  CONFIRMATION: "confirmation",
  COMPLETED: "completed",
}

export class CitizenChatbotService {
  private sessions: Map<string, ChatSession> = new Map()

  createSession(): ChatSession {
    const id = Date.now().toString()
    const session: ChatSession = {
      id,
      messages: [],
      currentStep: CITIZEN_STEPS.GREETING,
      collectedData: {} as ComplaintData & { language?: LanguageCode },
      isCompleted: false,
      createdAt: new Date().toISOString(),
    }

    this.sessions.set(id, session)

    // ✅ Add greeting with translation fallback
    const greeting =
      getTranslation("citizenGreeting", LANGUAGES.ENGLISH) ||
      "Hello! I am your Citizen e-FIR assistant."
    this.addBotMessage(session, greeting)

    return session
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
    const data = session.collectedData as ComplaintData & { language?: LanguageCode }

    switch (session.currentStep) {
      case CITIZEN_STEPS.GREETING:
        session.currentStep = CITIZEN_STEPS.LANGUAGE
        return getTranslation("citizenSelectLanguage", data.language || LANGUAGES.ENGLISH) ||
               "Please select your preferred language:\n1. English\n2. हिंदी (Hindi)\n3. मराठी"

      case CITIZEN_STEPS.LANGUAGE:
        if (userInput === "1") data.language = LANGUAGES.ENGLISH
        else if (userInput === "2") data.language = LANGUAGES.HINDI
        else if (userInput === "3") data.language = LANGUAGES.MARATHI
        else
          return getTranslation("invalidInput", data.language || LANGUAGES.ENGLISH) ||
                 "Invalid input. Please try again."

        session.currentStep = CITIZEN_STEPS.NAME
        return getTranslation("citizenName", data.language) || "May I know your full name?"

      case CITIZEN_STEPS.NAME:
        if (!userInput || userInput.length < 2)
          return getTranslation("invalidInput", data.language) || "Please enter a valid name."
        data.complainantName = userInput
        session.currentStep = CITIZEN_STEPS.PHONE
        return getTranslation("citizenPhone", data.language) || "Please provide your phone number."

      case CITIZEN_STEPS.PHONE:
        if (!userInput || userInput.length < 10)
          return getTranslation("invalidInput", data.language) || "Please enter a valid phone number."
        data.complainantPhone = userInput
        session.currentStep = CITIZEN_STEPS.ADDRESS
        return getTranslation("citizenAddress", data.language) || "Please provide your complete address."

      case CITIZEN_STEPS.ADDRESS:
        if (!userInput || userInput.length < 5)
          return getTranslation("invalidInput", data.language) || "Please provide a valid address."
        data.complainantAddress = userInput
        session.currentStep = CITIZEN_STEPS.FATHER_HUSBAND
        return getTranslation("citizenFatherHusband", data.language) || "Enter father or husband's name."

      case CITIZEN_STEPS.FATHER_HUSBAND:
        data.fatherHusbandName = userInput || "N/A"
        session.currentStep = CITIZEN_STEPS.DOB
        return getTranslation("citizenDOB", data.language) || "Enter your date of birth."

      case CITIZEN_STEPS.DOB:
        data.dob = userInput || "N/A"
        session.currentStep = CITIZEN_STEPS.NATIONALITY
        return getTranslation("citizenNationality", data.language) || "What is your nationality?"

      case CITIZEN_STEPS.NATIONALITY:
        data.nationality = userInput || "N/A"
        session.currentStep = CITIZEN_STEPS.OCCUPATION
        return getTranslation("citizenOccupation", data.language) || "What is your occupation?"

      case CITIZEN_STEPS.OCCUPATION:
        data.occupation = userInput || "N/A"
        session.currentStep = CITIZEN_STEPS.DISTRICT
        return getTranslation("citizenDistrict", data.language) || "Enter your district."

      case CITIZEN_STEPS.DISTRICT:
        data.district = userInput || "N/A"
        session.currentStep = CITIZEN_STEPS.INCIDENT_TYPE
        return getTranslation("citizenIncidentType", data.language) || "Select the type of incident."

      case CITIZEN_STEPS.INCIDENT_TYPE:
        data.incidentType = userInput || "Other"
        session.currentStep = CITIZEN_STEPS.PRIORITY
        return getTranslation("citizenPriority", data.language) || "Enter incident priority: High, Medium, Low."

      case CITIZEN_STEPS.PRIORITY:
        data.priority = userInput || "Medium"
        session.currentStep = CITIZEN_STEPS.DESCRIPTION
        return getTranslation("citizenDescribeIncident", data.language) || "Please describe your incident."

      case CITIZEN_STEPS.DESCRIPTION:
        if (!userInput || userInput.length < 10)
          return getTranslation("citizenProvideMoreDetails", data.language) || "Please provide more details."
        data.description = userInput
        session.currentStep = CITIZEN_STEPS.DATETIME
        return getTranslation("citizenSelectDateTime", data.language) || "Please provide date & time of incident."

      case CITIZEN_STEPS.DATETIME:
        if (!userInput) return getTranslation("invalidInput", data.language) || "Please enter date & time."
        data.incidentDateTime = userInput
        session.currentStep = CITIZEN_STEPS.LOCATION
        return getTranslation("citizenEnterLocation", data.language) || "Enter incident location."

      case CITIZEN_STEPS.LOCATION:
        if (!userInput || userInput.length < 3) return getTranslation("invalidInput", data.language) || "Provide a valid location."
        data.incidentLocation = userInput
        session.currentStep = CITIZEN_STEPS.VICTIM_DETAILS
        return getTranslation("citizenVictimDetails", data.language) || "Provide victim details (if any)."

      case CITIZEN_STEPS.VICTIM_DETAILS:
        data.victimDetails = userInput || "N/A"
        session.currentStep = CITIZEN_STEPS.EVIDENCE
        return getTranslation("citizenEvidenceUpload", data.language) || "Upload any evidence or describe it."

      case CITIZEN_STEPS.EVIDENCE:
        data.evidence = userInput || "N/A"
        session.currentStep = CITIZEN_STEPS.CONFIRMATION
        return getTranslation("citizenConfirmation", data.language) || "Confirm your complaint details."

      case CITIZEN_STEPS.CONFIRMATION:
        // Create FIR
        const fir = await createFIR(data, "CITIZEN_CHATBOT", [])
        session.isCompleted = true
        session.createdFIRId = fir.id
        session.currentStep = CITIZEN_STEPS.COMPLETED

        const lang = data.language || LANGUAGES.ENGLISH
        return `📄 e-FIR Summary:

👤 Name: ${data.complainantName || "N/A"}
📞 Phone: ${data.complainantPhone || "N/A"}
📍 Incident Location: ${data.incidentLocation || "N/A"}
⏰ Date & Time: ${data.incidentDateTime || "N/A"}
📝 Description: ${data.description || "N/A"}
👥 Victim Details: ${data.victimDetails || "N/A"}
📎 Evidence: ${data.evidence || "N/A"}

${getTranslation("citizenConfirmation", lang) || "Your complaint has been submitted successfully."}`

      case CITIZEN_STEPS.COMPLETED:
        return getTranslation("citizenAlreadySubmitted", data.language || LANGUAGES.ENGLISH) ||
               "You have already submitted your complaint."

      default:
        return getTranslation("citizenInvalidStep", data.language || LANGUAGES.ENGLISH) ||
               "Invalid step. Please start a new chat."
    }
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

  public getCompletedComplaints(): ChatSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isCompleted)
  }
}

export const citizenChatbotService = new CitizenChatbotService()

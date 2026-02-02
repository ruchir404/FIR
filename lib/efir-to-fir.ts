import type { EFIR } from "@/lib/efir"
import type { FIRFormData } from "@/lib/fir"

export const mapEFIRToFIRForm = (efir: EFIR): FIRFormData => {
  return {
    complainantName: efir.citizenName,
    complainantPhone: efir.citizenPhone,
    complainantAddress: efir.location,
    incidentType: efir.incidentType,
    incidentLocation: efir.location,
    incidentDateTime: `${efir.incidentDate}T${efir.incidentTime}`,
    description: efir.incidentDescription,
    priority: "Medium",
    policeStation: efir.policeStation,
    district: efir.district,
    beatNumber: efir.beatNumber,
    informationType: "Written",
    reasonForDelay: "",
    propertiesInvolved: "",
  }
}

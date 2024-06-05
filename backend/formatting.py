from models import PatientInformation


def format_patient_info(patient_info: PatientInformation):
    details = [
        f"Name: {patient_info.name or 'Not provided'}",
        f"Age: {patient_info.age or 'Not provided'}",
        f"Weight: {patient_info.weight or 'Not provided'} kg",
        f"Height: {patient_info.height or 'Not provided'} cm",
        f"Gender: {patient_info.gender or 'Not provided'}",
    ]

    return "\n".join(details)

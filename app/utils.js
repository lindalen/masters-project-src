const DEV_URL = "http://192.168.0.124:8000";
const PROD_URL = "https://backend-7cml.onrender.com";

export const proxyUrl = PROD_URL;

export async function postChatMessage(messages, user_id, memory, model) {
  try {
    const response = await fetch(`${proxyUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, user_id, model, memory }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
}

export async function postConversation(user_id, messages) {
  try {
    const response = await fetch(`${proxyUrl}/api/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, messages }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
}

export async function deleteConversations(user_id) {
  try {
    const response = await fetch(`${proxyUrl}/api/conversations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
}

export async function deletePatientInformation(user_id) {
  try {
    const response = await fetch(`${proxyUrl}/api/patient_information/${user_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
}

export async function deleteObservation(user_id, observation_id) {
  try {
    const response = await fetch(`${proxyUrl}/api/observations/${user_id}/${observation_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
}


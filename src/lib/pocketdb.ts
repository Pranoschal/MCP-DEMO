import pb from "@/lib/pocketbase"
export async function saveUser(formData: { username: string; email: string; password: string }) {
    try {
    const newUser = await pb.collection("User_data").create({
        username: formData.username,
        email: formData.email,
        password: formData.password, 
    });

    return newUser;
    } catch (error) {
    console.error("Error saving user:", error);
    throw error;
    }
}
export async function fetchAgents() {
  try {
    const agents = await pb.collection("FW_AGENTS_DATA").getFullList();
    return agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      icon: agent.icons ? pb.files.getURL(agent, agent.icons) : null,
    }));
  } catch (error) {
    console.error("❌ Error fetching agents:", error);
    throw error;
  }
}

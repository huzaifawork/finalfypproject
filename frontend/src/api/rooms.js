// src/api/rooms.ts
export const fetchRooms = async () => {
    try {
      const response = await fetch("https://finalfypproject-ly9tb7oa1-huzaifas-projects-eabfae35.vercel.app/api/rooms");
      return await response.json();
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  };
  
// src/api/lobby.js

const API_URL = "http://localhost/ton-dossier-php"; // L'adresse du XAMPP de ton pote

export const checkLobbyStatus = async (roomCode) => {
  try {
    const response = await fetch(
      `${API_URL}/get_players_count.php?code=${roomCode}`,
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Erreur check lobby:", error);
  }
};

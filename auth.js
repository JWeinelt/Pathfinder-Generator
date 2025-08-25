async function authenticate() {
  const token = getCookie('authToken');

  try {
    const response = await fetch("https://pathfinder.julianweinelt.de/api/v1/auth", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      }
    });

    if (!response.ok) throw new Error("Network error");

    json = await response.json();

    if (json.success) {
      document.getElementById('account').textContent = "Account";
      document.getElementById('account').href = "/account";
        document.getElementById("user-actions").classList.remove('hidden');
    } else {
      document.getElementById('account').textContent = "Login";
      document.getElementById('account').href = "/login";
    }

    console.log("Data:", json);
    displayNamespaces();

  } catch (error) {
    console.error("Error while loading data:", error);
      document.getElementById('account').textContent = "Login";
      document.getElementById('account').href = "/login";
  }
}


authenticate();
function getNewRow(namespace, status) {
    let colorClass = "bg-gray-200 text-gray-700";

    if (status === "APPROVED") colorClass = "bg-green-200 text-green-700";
    if (status === "UNDER_REVIEW") colorClass = "bg-yellow-200 text-yellow-700";
    if (status === "ACTION_REQUIRED") colorClass = "bg-red-200 text-red-700";

    let displayStatus = status.toLowerCase().replace(/_/g, " ");
    displayStatus = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);

    let editID = "edit-btn-" + namespace;
    let delID = "del-btn-" + namespace;

    return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4">${namespace}</td>
          <td class="px-6 py-4">
            <span class="rounded-full ${colorClass} px-3 py-1 text-xs font-medium">
              ${displayStatus}
            </span>
          </td>
          <td class="px-6 py-4">
            <button id="${editID}" class="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-yellow-600">
              Edit
            </button>
            <button id="${delID}" class="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-red-600">
              Delete
            </button>
          </td>
        </tr>
    `;
}

let json = {
};

function displayNamespaces() {
  let tbody = document.querySelector("#namespaces-body");
  tbody.innerHTML = "";

  json.namespaces.forEach(ns => {
    tbody.insertAdjacentHTML("beforeend", getNewRow(ns.name, ns.status));
  });
}

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
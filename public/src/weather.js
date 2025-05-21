import {
  // Nie używane na ten momencik
  openDatabase,
  getWeatherWithRefresh,
} from "./db.js";

const form = document.getElementById("weather-form");
const input = document.getElementById("weather-input");
const details = document.getElementById("weather-details");
const historyList = document.getElementById("weather-history");

function renderWeather(data, city) {
  if (!data) {
    details.innerHTML =
      "<p>Brak danych pogodowych. Upewnij się, że miasto zostało prawidłowo napisane</p>";
    return;
  }
  details.innerHTML = `
      <div>
        <h3>${city}</h3>
        <p><b>Temperatura:</b> ${data.temperature}</p>
        <p><b>Wiatr:</b> ${data.wind}</p>
        <p><b>Opis:</b> ${data.description}</p>
        <h4>Prognoza:</h4>
        <ul>
          ${data.forecast
            .map(
              (f) =>
                `<li>Dzień ${f.day}: ${f.temperature}, wiatr: ${f.wind}</li>`
            )
            .join("")}
        </ul>
      </div>
    `;
}

async function renderHistory() {
  historyList.innerHTML = "";
  const db = await openDatabase();
  const transaction = db.transaction(["weather"], "readonly");
  const store = transaction.objectStore("weather");
  const req = store.openCursor();
  const items = [];
  req.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      items.push(cursor.value);
      cursor.continue();
    } else {
      if (items.length === 0) {
        historyList.innerHTML = "<li>Brak historii wyszukiwań.</li>";
        return;
      }
      items.sort((a, b) => b.timestamp - a.timestamp);
      items.forEach((item) => {
        const date = new Date(item.timestamp);
        historyList.innerHTML += `<li><b>${
          item.id
        }</b> — ${date.toLocaleString()}</li>`;
      });
    }
  };
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  details.innerHTML = "<p>Ładowanie pogody...</p>";

  try {
    const data = await getWeatherWithRefresh(city.toLowerCase());
    renderWeather(data, city);
    await renderHistory();
  } catch (err) {
    details.innerHTML = "<p>Błąd pobierania danych pogodowych.</p>";
  }
});

renderHistory();

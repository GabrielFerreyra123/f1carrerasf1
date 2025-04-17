
let temporadaActual = "2025";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("nav button").forEach(boton => {
    boton.addEventListener("click", () => {
      mostrarSeccion(boton.getAttribute("data-seccion"));
    });
  });

  const selector = document.getElementById("temporadaSelector");
  selector.value = temporadaActual;
  selector.addEventListener("change", () => {
    temporadaActual = selector.value;
    cargarTodo();
  });

  const modoBtn = document.createElement("button");
  modoBtn.id = "modo-toggle";
  modoBtn.innerText = "Modo Claro / Oscuro";
  document.body.appendChild(modoBtn);

  modoBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });

  cargarTodo();
});

function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));
  document.getElementById(id).classList.add("activa");
}

function cargarTodo() {
  cargarCalendario();
  cargarResultados();
  cargarPosiciones();
  cargarClasificacion();
}

function getFlag(nationality) {
  const flags = {
    British: "gb", Spanish: "es", German: "de", Dutch: "nl",
    Mexican: "mx", Monegasque: "mc", French: "fr", Australian: "au",
    Canadian: "ca", Finnish: "fi", Japanese: "jp", Chinese: "cn",
    Thai: "th", Brazilian: "br", Argentine: "ar", Italian: "it",
    American: "us", Danish: "dk"
  };
  const code = flags[nationality] || "xx";
  return `<img class="flag" src="https://flagcdn.com/h20/${code}.png" alt="${nationality}">`;
}

function getPilotImg(driver) {
  const name = driver.familyName.toLowerCase();
  return `<img src="https://www.formula1.com/content/dam/fom-website/drivers/${name}.jpg.transform/2col/image.jpg" alt="${driver.familyName}" onerror="this.style.display='none'">`;
}

function cargarCalendario() {
  const div = document.getElementById("calendario");
  div.innerHTML = "Cargando calendario...";

  fetch(`https://ergast.com/api/f1/${temporadaActual}.json`)
    .then(res => res.json())
    .then(data => {
      div.innerHTML = "";
      data.MRData.RaceTable.Races.forEach(race => {
        const fecha = new Date(race.date);
        const carreraEl = document.createElement("div");
        carreraEl.className = "race";
        carreraEl.innerHTML = `
          <h2><a href="https://www.youtube.com/results?search_query=F1+${race.raceName}+${temporadaActual}+completa" target="_blank">${race.raceName}</a></h2>
          <p><strong>Fecha:</strong> ${fecha.toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          <p><strong>Circuito:</strong> ${race.Circuit.circuitName}</p>
          <p><strong>Ubicación:</strong> ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}</p>
        `;
        div.appendChild(carreraEl);
      });
    });
}

function cargarResultados() {
  const div = document.getElementById("resultados");
  div.innerHTML = "Cargando resultados...";

  fetch(`https://ergast.com/api/f1/${temporadaActual}/last/results.json`)
    .then(res => res.json())
    .then(data => {
      div.innerHTML = "";
      const race = data.MRData.RaceTable.Races[0];
      if (!race || !race.Results) {
        div.innerHTML = "<p>No hay resultados para esta temporada aún.</p>";
        return;
      }

      const titulo = document.createElement("h2");
      titulo.textContent = `${race.raceName} - ${race.Circuit.circuitName}`;
      div.appendChild(titulo);

      const subtitulo = document.createElement("p");
      subtitulo.textContent = `Fecha: ${new Date(race.date).toLocaleDateString("es-AR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      })}`;
      div.appendChild(subtitulo);

      const tabla = document.createElement("table");
      tabla.innerHTML = `
        <thead>
          <tr>
            <th>Pos</th>
            <th>Piloto</th>
            <th>Equipo</th>
            <th>Vueltas</th>
            <th>Tiempo / Estado</th>
          </tr>
        </thead>
        <tbody>
          ${race.Results.map(p => `
            <tr>
              <td>${p.position}</td>
              <td class="piloto">${getPilotImg(p.Driver)} ${getFlag(p.Driver.nationality)}${p.Driver.givenName} ${p.Driver.familyName}</td>
              <td>${p.Constructor.name}</td>
              <td>${p.laps}</td>
              <td>${p.Time?.time || p.status}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      div.appendChild(tabla);
    });
}

function cargarPosiciones() {
  const div = document.getElementById("posiciones");
  div.innerHTML = "Cargando posiciones...";

  fetch(`https://ergast.com/api/f1/${temporadaActual}/driverStandings.json`)
    .then(res => res.json())
    .then(data => {
      div.innerHTML = "";
      const standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings;
      if (!standings) {
        div.innerHTML = "<p>No hay posiciones disponibles.</p>";
        return;
      }

      const tabla = document.createElement("table");
      tabla.innerHTML = `
        <thead>
          <tr>
            <th>Pos</th>
            <th>Piloto</th>
            <th>Nacionalidad</th>
            <th>Equipo</th>
            <th>Puntos</th>
          </tr>
        </thead>
        <tbody>
          ${standings.map(p => `
            <tr>
              <td>${p.position}</td>
              <td class="piloto">${getPilotImg(p.Driver)} ${p.Driver.givenName} ${p.Driver.familyName}</td>
              <td>${getFlag(p.Driver.nationality)} ${p.Driver.nationality}</td>
              <td>${p.Constructors[0].name}</td>
              <td>${p.points}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      div.appendChild(tabla);
    });
}

function cargarClasificacion() {
  const div = document.getElementById("clasificacion");
  div.innerHTML = "Cargando clasificación...";

  fetch(`https://ergast.com/api/f1/${temporadaActual}/last/qualifying.json`)
    .then(res => res.json())
    .then(data => {
      div.innerHTML = "";
      const qualy = data.MRData.RaceTable.Races[0];
      if (!qualy || !qualy.QualifyingResults) {
        div.innerHTML = "<p>No hay clasificación disponible.</p>";
        return;
      }

      const tabla = document.createElement("table");
      tabla.innerHTML = `
        <thead>
          <tr>
            <th>Pos</th>
            <th>Piloto</th>
            <th>Equipo</th>
            <th>Q1</th>
            <th>Q2</th>
            <th>Q3</th>
          </tr>
        </thead>
        <tbody>
          ${qualy.QualifyingResults.map(p => `
            <tr>
              <td>${p.position}</td>
              <td class="piloto">${getPilotImg(p.Driver)} ${getFlag(p.Driver.nationality)} ${p.Driver.givenName} ${p.Driver.familyName}</td>
              <td>${p.Constructor.name}</td>
              <td>${p.Q1 || "-"}</td>
              <td>${p.Q2 || "-"}</td>
              <td>${p.Q3 || "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      div.appendChild(tabla);
    });
}

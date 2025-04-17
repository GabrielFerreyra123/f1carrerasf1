
let temporadaActual = "2025";

document.addEventListener("DOMContentLoaded", () => {
  const modoBtn = document.getElementById("modo-toggle");
  const savedMode = localStorage.getItem("modo");
  if (savedMode === "claro") document.body.classList.add("light-mode");

  modoBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("modo", document.body.classList.contains("light-mode") ? "claro" : "oscuro");
  });

  document.querySelectorAll("nav button").forEach(boton => {
    boton.addEventListener("click", () => {
      document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));
      document.getElementById(boton.getAttribute("data-seccion")).classList.add("activa");
    });
  });

  const selector = document.getElementById("temporadaSelector");
  selector.addEventListener("change", () => {
    temporadaActual = selector.value;
    cargarTodo();
  });

  cargarTodo();
});

function mostrarLoader() {
  document.getElementById("loader").style.display = "flex";
}
function ocultarLoader() {
  document.getElementById("loader").style.display = "none";
}

function cargarTodo() {
  mostrarLoader();
  Promise.all([
    cargarCalendario(),
    cargarResultados(),
    cargarPosiciones(),
    cargarClasificacion()
  ]).then(() => ocultarLoader());
}

function cargarCalendario() {
  const div = document.getElementById("calendario");
  return fetch(`https://ergast.com/api/f1/${temporadaActual}.json`)
    .then(res => res.json())
    .then(data => {
      div.innerHTML = "";
      data.MRData.RaceTable.Races.forEach(race => {
        const fecha = new Date(race.date);
        const html = `
          <div class="race">
            <h2><a href="https://www.youtube.com/results?search_query=F1+${race.raceName}+${temporadaActual}+completa" target="_blank">${race.raceName}</a></h2>
            <p><strong>Fecha:</strong> ${fecha.toLocaleDateString("es-AR")}</p>
            <p><strong>Circuito:</strong> ${race.Circuit.circuitName}</p>
            <p><strong>Ubicación:</strong> ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}</p>
          </div>`;
        div.innerHTML += html;
      });
    });
}

function cargarResultados() {
  const selectorDiv = document.getElementById("selectorCarreraResultados");
  const detalleDiv = document.getElementById("detalleResultados");

  return fetch(`https://ergast.com/api/f1/${temporadaActual}.json`)
    .then(res => res.json())
    .then(data => {
      const carreras = data.MRData.RaceTable.Races;
      selectorDiv.innerHTML = `
        <label for="carreraSelectResultados">Seleccioná una carrera:</label>
        <select id="carreraSelectResultados">
          ${carreras.map(r => `<option value="${r.round}">${r.round} - ${r.raceName}</option>`).join("")}
        </select>
      `;
      const select = document.getElementById("carreraSelectResultados");
      select.addEventListener("change", e => mostrarResultadosCarrera(e.target.value));
      return mostrarResultadosCarrera(carreras[0].round);
    });

  function mostrarResultadosCarrera(round) {
    detalleDiv.innerHTML = "Cargando...";
    return fetch(`https://ergast.com/api/f1/${temporadaActual}/${round}/results.json`)
      .then(res => res.json())
      .then(data => {
        const race = data.MRData.RaceTable.Races[0];
        if (!race) return detalleDiv.innerHTML = "<p>No hay resultados.</p>";
        detalleDiv.innerHTML = `
          <h2>${race.raceName}</h2>
          <table><thead><tr>
            <th>Pos</th><th>Piloto</th><th>Equipo</th><th>Vueltas</th><th>Tiempo / Estado</th>
          </tr></thead><tbody>
            ${race.Results.map(r => `
              <tr>
                <td>${r.position}</td>
                <td>${r.Driver.givenName} ${r.Driver.familyName}</td>
                <td>${r.Constructor.name}</td>
                <td>${r.laps}</td>
                <td>${r.Time?.time || r.status}</td>
              </tr>
            `).join("")}
          </tbody></table>
        `;
      });
  }
}

function cargarPosiciones() {
  const divPilotos = document.getElementById("tablaPosicionesPilotos");
  const divEquipos = document.getElementById("tablaPosicionesEquipos");

  return Promise.all([
    fetch(`https://ergast.com/api/f1/${temporadaActual}/driverStandings.json`).then(r => r.json()),
    fetch(`https://ergast.com/api/f1/${temporadaActual}/constructorStandings.json`).then(r => r.json())
  ]).then(([pilotos, equipos]) => {
    const p = pilotos.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
    divPilotos.innerHTML = `<h2>Pilotos</h2><table>
      <thead><tr><th>Pos</th><th>Piloto</th><th>Equipo</th><th>Puntos</th></tr></thead><tbody>
      ${p.map(p => `
        <tr${p.position === "1" ? " style='background:gold;color:black'" : ""}>
          <td>${p.position}</td>
          <td>${p.Driver.givenName} ${p.Driver.familyName}</td>
          <td>${p.Constructors[0].name}</td>
          <td>${p.points}</td>
        </tr>`).join("")}
      </tbody></table>`;

    const c = equipos.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
    divEquipos.innerHTML = `<h2>Constructores</h2><table>
      <thead><tr><th>Pos</th><th>Equipo</th><th>Puntos</th></tr></thead><tbody>
      ${c.map(e => `
        <tr${e.position === "1" ? " style='background:gold;color:black'" : ""}>
          <td>${e.position}</td>
          <td>${e.Constructor.name}</td>
          <td>${e.points}</td>
        </tr>`).join("")}
      </tbody></table>`;
  });
}

function cargarClasificacion() {
  const selector = document.getElementById("selectorCarreraClasificacion");
  const detalle = document.getElementById("detalleClasificacion");

  return fetch(`https://ergast.com/api/f1/${temporadaActual}.json`)
    .then(res => res.json())
    .then(data => {
      const carreras = data.MRData.RaceTable.Races;
      selector.innerHTML = `
        <label for="carreraSelectClasificacion">Seleccioná una carrera:</label>
        <select id="carreraSelectClasificacion">
          ${carreras.map(r => `<option value="${r.round}">${r.round} - ${r.raceName}</option>`).join("")}
        </select>
      `;
      const select = document.getElementById("carreraSelectClasificacion");
      select.addEventListener("change", e => mostrarClasificacion(e.target.value));
      return mostrarClasificacion(carreras[0].round);
    });

  function mostrarClasificacion(round) {
    detalle.innerHTML = "Cargando...";
    return fetch(`https://ergast.com/api/f1/${temporadaActual}/${round}/qualifying.json`)
      .then(res => res.json())
      .then(data => {
        const q = data.MRData.RaceTable.Races[0];
        if (!q || !q.QualifyingResults) return detalle.innerHTML = "<p>No hay datos.</p>";
        detalle.innerHTML = `
          <h2>${q.raceName}</h2>
          <table><thead><tr>
            <th>Pos</th><th>Piloto</th><th>Equipo</th><th>Q1</th><th>Q2</th><th>Q3</th>
          </tr></thead><tbody>
            ${q.QualifyingResults.map(r => `
              <tr>
                <td>${r.position}</td>
                <td>${r.Driver.givenName} ${r.Driver.familyName}</td>
                <td>${r.Constructor.name}</td>
                <td>${r.Q1 || "-"}</td>
                <td>${r.Q2 || "-"}</td>
                <td>${r.Q3 || "-"}</td>
              </tr>
            `).join("")}
          </tbody></table>`;
      });
  }
}


const clasificaciones = {
  bahrain: `
    <h3>Clasificación Bahréin</h3>
    <ul><li>Q1: 1:31.2</li><li>Q2: 1:30.5</li><li>Q3: 1:29.8</li></ul>`,
  jeddah: `
    <h3>Clasificación Jeddah</h3>
    <ul><li>Q1: 1:29.9</li><li>Q2: 1:29.3</li><li>Q3: 1:28.6</li></ul>`,
  australia: `
    <h3>Clasificación Australia</h3>
    <ul><li>Q1: 1:22.8</li><li>Q2: 1:22.0</li><li>Q3: 1:21.5</li></ul>`
};

document.getElementById("raceSelector").addEventListener("change", function () {
  const seleccion = this.value;
  document.getElementById("clasificacion-container").innerHTML = clasificaciones[seleccion];
});

// Mostrar la primera por defecto
document.getElementById("raceSelector").value = "bahrain";
document.getElementById("clasificacion-container").innerHTML = clasificaciones.bahrain;

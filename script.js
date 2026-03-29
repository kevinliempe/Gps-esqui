// --- 1. DATOS (Modelo) ---


// --- 2. VARIABLES DE ESTADO ---
let map = L.map('map').setView([42.5488, 1.6468], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let capasPistas = [];
let capaRutaActiva = null;
let idRastreo = null;
let marcadorUsuario = L.marker([42.5488, 1.6468]).addTo(map).bindPopup("Tu ubicación");



// --- 3. FUNCIONES LÓGICAS ---

// --- 1. DATOS (Modelo) ---
const pistas = [
    { nombre: "TC10-Tarter", dificultad: "principiante", color: "blue", puntos: [[42.57854138795704, 1.6459994999626317],[42.568675615900524, 1.642839581923151]] },
    { nombre: "Guineu", dificultad: "principiante", color: "blue", puntos: [[42.548828, 1.646838], [42.552298, 1.643571], [42.554229, 1.640143], [42.555272, 1.639291], [42.558309, 1.641520], [42.561603, 1.643045], [42.566912, 1.641973]] },
    { nombre: "Llop", dificultad: "experto", color: "red", puntos: [[42.548828, 1.646838], [42.550887, 1.648052], [42.554983, 1.647073], [42.556811, 1.645304], [42.557392, 1.644698], [42.558029, 1.644075], [42.559761, 1.643378]] },
    { nombre: "Rossinyol", dificultad: "principiante", color: "blue", puntos: [[42.552583, 1.628271], [42.549705, 1.623742], [42.547499, 1.621288], [42.546555, 1.620268], [42.545870, 1.616145], [42.547366, 1.616479], [42.548083, 1.617174], [42.548941, 1.616993], [42.549240, 1.615938], [42.550117, 1.614855], [42.549586, 1.614395], [42.551174, 1.613457], [42.551613, 1.613565], [42.553028, 1.613367]] },
    { nombre: "Miquel", dificultad: "experto", color: "red", puntos: [[42.548828, 1.646838], [42.552582, 1.649645], [42.554009, 1.649343], [42.556845, 1.648467], [42.558196, 1.645914], [42.558694, 1.645463], [42.560978, 1.643500]] }
];

const estadosPistas = {
    "Guineu": { estado: "Abierta", nieve: "Polvo", gente: "Media", aviso: "Cuidado en el cruce" },
    "Llop": { estado: "Cerrada", nieve: "Dura", gente: "Baja", aviso: "Hielo en la entrada" },
    "Rossinyol": { estado: "Abierta", nieve: "Primavera", gente: "Alta", aviso: "Ninguno" },
    "Miquel": { estado: "Abierta", nieve: "Polvo/Dura", gente: "Baja", aviso: "Placas de hielo" }
};

// --- FUNCIÓN ÚNICA DE DIBUJO ---
function actualizarMapa() {
    // 1. Limpiar capas existentes
    capasPistas.forEach(capa => map.removeLayer(capa));
    capasPistas = [];

    const nivel = document.getElementById('nivelUsuario').value;

    pistas.forEach(pista => {
        if (nivel === "todos" || nivel === pista.dificultad) {
            
            // 2. Capa Visual (Línea de la pista)
            const lineaVisual = L.polyline(pista.puntos, {
                color: pista.color,
                weight: 12,
                opacity: 0.6,
                lineJoin: 'round'
            }).addTo(map);

            // 3. Capa Invisible (Zona de Clic ancha)
            const zonaInteractiva = L.polyline(pista.puntos, {
                color: 'transparent',
                weight: 40, 
                interactive: true
            }).addTo(map);

            // 4. Configurar el Evento Clic
            zonaInteractiva.on('click', function(e) {
                // Buscamos los datos en estadosPistas (antes había error de nombre aquí)
                const info = estadosPistas[pista.nombre] || { estado: "Sin datos", nieve: "-", gente: "-", aviso: "-" };
                
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent(`
                        <div style="font-family: 'Segoe UI', sans-serif; min-width: 160px;">
                            <h3 style="margin:0; color:${pista.color}; text-transform:uppercase;">${pista.nombre}</h3>
                            <hr style="border:0; border-top:1px solid #eee;">
                            <b>Estado:</b> ${info.estado}<br>
                            <b>Nieve:</b> ${info.nieve} ❄️<br>
                            <b>Gente:</b> ${info.gente} 👥<br>
                            <p style="margin:5px 0 0 0; font-size:0.9em; color:#e74c3c;"><b>⚠️:</b> ${info.aviso}</p>
                            <button onclick="fijarDestinoGPS('${pista.nombre}')" style="margin-top:10px; width:100%; cursor:pointer; background:#2ecc71; color:white; border:none; padding:5px; border-radius:4px;">Navegar aquí</button>
                        </div>
                    `)
                    .openOn(map);
            });

            // Guardamos ambas para poder borrarlas luego
            capasPistas.push(lineaVisual, zonaInteractiva);
        }
    });
}

function fijarDestinoGPS(nombrePista) {
    document.getElementById('destinoFinal').value = nombrePista;
    guiarUsuario(); 
    map.closePopup(); // Cerramos el popup al iniciar ruta
}

// Mantén el resto de tus funciones (guiarUsuario, simularDescenso, etc.) igual.



function fijarDestinoGPS(nombrePista) {
    document.getElementById('destinoFinal').value = nombrePista;
    guiarUsuario(); // Llama a tu función existente de iniciar ruta
}

function verificarDesvioMejorado(posActual, nombrePistaDestino) {
    const pista = pistas.find(p => p.nombre === nombrePistaDestino);
    const margenSeguridad = 25; // 25 metros de margen (el ancho de una pista real)
    
    const distancia = calcularDistanciaMinimaALinea(posActual, pista.puntos);

    if (distancia > margenSeguridad) {
        // Solo avisar si realmente estás lejos (ej. 30 metros fuera del eje)
        log("⚠️ Te has alejado de la pista principal.");
    }
}



function guiarUsuario() {
    const destino = document.getElementById('destinoFinal').value;
    const panelInstrucciones = document.getElementById('instrucciones');
    if (!destino) return;

    if (capaRutaActiva) map.removeLayer(capaRutaActiva);
    const pistaSeleccionada = pistas.find(p => p.nombre === destino);

    if (pistaSeleccionada) {
        capaRutaActiva = L.polyline(pistaSeleccionada.puntos, {
            color: '#2ecc71',
            weight: 10,
            opacity: 1,
            dashArray: '10, 15'
        }).addTo(map);

        map.fitBounds(capaRutaActiva.getBounds(), { padding: [50, 50] });

        panelInstrucciones.innerHTML = `
            <strong>Ruta Activa:</strong> ${pistaSeleccionada.nombre}<br>
            <strong>Dificultad:</strong> ${pistaSeleccionada.dificultad.toUpperCase()}<br>
            <em>Sigue la línea discontinua verde.</em>
        `;

        setTimeout(() => {
            if(confirm("¿Quieres simular el descenso por " + pistaSeleccionada.nombre + "?")){
                simularDescenso(pistaSeleccionada.puntos);
            }
        }, 500);
    }
}


function simularDescenso(puntos) {
    let i = 0;
    const animacion = setInterval(() => {
        if (i < puntos.length) {
            marcadorUsuario.setLatLng(puntos[i]);
            map.panTo(puntos[i]);
            i++;
        } else {
            clearInterval(animacion);
            alert("¡Has llegado al final de la pista!");
        }
    }, 800);
}

function iniciarRastreoReal() {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta GPS.");
        return;
    }

    const opcionesGps = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };

    idRastreo = navigator.geolocation.watchPosition(pos => {
        const nuevaPos = [pos.coords.latitude, pos.coords.longitude];
        marcadorUsuario.setLatLng(nuevaPos);
        map.flyTo(nuevaPos, 16);
        verificarDesvio(nuevaPos);
        log("GPS OK: " + pos.coords.latitude);
    }, err => {
        log("ERROR GPS: " + err.message);
    }, opcionesGps);
}

function verificarDesvio(posActual) {
    const destino = document.getElementById('destinoFinal').value;
    if (!destino) return;

    const datosPista = pistas.find(p => p.nombre === destino);
    if (!datosPista) return;

    const miPos = L.latLng(posActual);
    
    // Buscamos el punto más cercano de toda la polilínea, no solo el primero
    const puntosPoly = datosPista.puntos.map(p => L.latLng(p));
    let distanciaMinima = Infinity;

    // Calculamos la distancia al segmento más cercano de la pista
    for (let i = 0; i < puntosPoly.length - 1; i++) {
        const d = L.LineUtil.pointToSegmentDistance(
            map.latLngToLayerPoint(miPos),
            map.latLngToLayerPoint(puntosPoly[i]),
            map.latLngToLayerPoint(puntosPoly[i+1])
        );
        // Convertimos la distancia de píxeles a metros aproximadamente
        const dMetros = miPos.distanceTo(puntosPoly[i]); 
        if (dMetros < distanciaMinima) distanciaMinima = dMetros;
    }

    // AJUSTE DE ANCHO: 50 metros de margen (ajusta según la pista)
    const anchoPermitido = 50; 

    if (distanciaMinima > anchoPermitido) {
        document.getElementById('instrucciones').innerHTML = 
            `<span style='color: #e74c3c;'>⚠️ FUERA DE PISTA (${Math.round(distanciaMinima)}m)</span>`;
    } else {
        document.getElementById('instrucciones').innerHTML = 
            `<span style='color: #2ecc71;'>✅ En pista: ${datosPista.nombre}</span>`;
    }
}

function detenerRastreo() {
    if (idRastreo) {
        navigator.geolocation.clearWatch(idRastreo);
        alert("GPS desactivado.");
    }
}

function log(msg) {
    const div = document.getElementById('debug-log');
    div.innerHTML += "<br>> " + msg;
}

// --- 4. EVENT LISTENERS (Vínculos) ---
document.getElementById('nivelUsuario').addEventListener('change', actualizarMapa);
document.getElementById('btnIniciarRuta').addEventListener('click', guiarUsuario);
document.getElementById('btnActivarGps').addEventListener('click', iniciarRastreoReal);
document.getElementById('btnDetenerGps').addEventListener('click', detenerRastreo);

// Inicialización
actualizarMapa();

// --- 1. DATOS (Modelo) ---


// --- 2. VARIABLES DE ESTADO ---
let map = L.map('map').setView([42.5488, 1.6468], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let capasPistas = [];
let capaRutaActiva = null;
let idRastreo = null;
let marcadorUsuario = L.marker([42.578602216459736, 1.646525135069369]).addTo(map).bindPopup("Tu ubicación");

// Definimos los puntos clave (Nodos) de la estación
const conexiones = {
    "BASE_TARTER": { nombre: "Base El Tarter", remonte: "TC10-Tarter" },
    "CIMA_TARTER": { nombre: "Riba Escorjada", pistas: ["Guineu", "Rossinyol"], remonte: "TSD-Llosada" },
    "CIMA_LLOSADA": { nombre: "Cima Llosada", pistas: ["Oreneta", "Miquel"] },
    "BASE_CLOTS": { nombre: "Pie de Clots", remonte: "TS-Clots" },
    "CIMA_CLOTS": { nombre: "Cima Clots", pistas: ["Rossinyol"] },
    "DESTINO_PORTELLA": { nombre: "TSD Portella", remonte: "TSD-Portella" }
};

const redConexiones = {
    // Formato -> "Origen": ["SiguientePaso1", "SiguientePaso2"]
    "TC10-Tarter": ["TSD-Llosada", "Guineu"], 
    "TSD-Llosada": ["Oreneta", "Miquel"],
    "Oreneta": ["TS-Clots"],
    "TS-Clots": ["Rossinyol"],
    "Rossinyol": ["TSD-Portella"]
};

const redGrandvalira = {
    "TC10-Tarter": { destino: "LLOSADA_BASE"},
    "LLOSADA_BASE": { opciones: ["TSD-Llosada", "Guineu"] },
    "TSD-Llosada": { destino: "LLOSADA_CIMA" },
    "LLOSADA_CIMA": { opciones: ["Oreneta", "Miquel","Ts-Clots"] },
    "Oreneta": { destino: "CLOTS_BASE" },
    "CLOTS_BASE": { opciones: ["TS-Clots"] },
    "TS-Clots": { destino: "CLOTS_CIMA" },
    "CLOTS_CIMA": { opciones: ["Rossinyol"] },
    "Rossinyol": { destino: "PORTELLA_BASE" },
    "PORTELLA_BASE": { opciones: ["TSD-Portella"] }
};

// --- 3. FUNCIONES LÓGICAS ---

// --- 1. DATOS (Modelo) ---
const pistas = [
    {nombre:"TC10-Tarter",dificultad:"principiante",color:"yellow", puntos:[[42.57854138795704, 1.6459994999626317],[42.568675615900524, 1.642839581923151]]},
    {nombre:"TSD-Llosada",dificultad:"principiante",color:"yellow", puntos:[[42.5664570674654, 1.6419565185347562],[42.54905133806246, 1.646637443120172]]},
    {nombre:"TS-Clots",dificultad:"principiante",color:"yellow", puntos:[[42.552743028287956, 1.6376774494756685],[42.55257442815744, 1.6284943318415803]]},
    {nombre:"TS-Pi de mig dia",dificultad:"principiante",color:"yellow", puntos:[[42.57058168155865, 1.6403844416294706],[42.56700030416377, 1.6469401666772125]]},
    {nombre:"TSD-Portella",dificultad:"principiante",color:"yellow", puntos:[[42.5535861055435, 1.6133186560698958],[42.552664271554434, 1.6281280804421434]]},

    {nombre:"Os",dificultad:"principiante",color:"blue", puntos:[[42.57421883109314, 1.6653632572432695],[42.57481839705514, 1.6671657257631054],[42.574608898930904, 1.668910605257536]]},
    {nombre:"Gall de bosc",dificultad:"principiante",color:"blue", puntos:[[42.56845609850836, 1.6473243982625378],[42.56907418140498, 1.6515052500519434],[42.568455895085, 1.6528248968827863],[42.56878564762333, 1.6538102175020513],[42.56944343736862, 1.6547275329673117],[42.5698543055347, 1.6565541173323177],[42.56991356514117, 1.6587696219355494],[42.57083967905528, 1.6593447178109173],[42.570823068910705, 1.659331185051507],[42.57226481301246, 1.6624031214952875],[42.572940446941594, 1.6644210883584694],[42.573601504837626, 1.6669246488493985],[42.57421937173325, 1.6652962067785966],[42.57421937173437, 1.663266292849757],[42.5744286478422, 1.660099627102467],[42.574826013509515, 1.6547986995883068],[42.575575985162644, 1.6517505998442072],[42.57616852434765, 1.6507099027272398],[42.57755504402094, 1.6491220349847915]]},
    {nombre:"Oreneta",dificultad:"principiante",color:"blue", puntos:[[42.54912665511862, 1.6462260174359975],[42.55008704812323, 1.6447577130196218],[42.55234175356803, 1.641679010194119],[42.553003029767595, 1.6403866316447737],[42.55307945822724, 1.639529556864925]]},
    { nombre: "Guineu", dificultad: "principiante", color: "blue", puntos: [[42.548828, 1.646838], [42.552298, 1.643571], [42.554229, 1.640143], [42.555272, 1.639291], [42.558309, 1.641520], [42.561603, 1.643045], [42.566912, 1.641973]] },
    { nombre: "Llop", dificultad: "experto", color: "red", puntos: [[42.548828, 1.646838], [42.550887, 1.648052], [42.554983, 1.647073], [42.556811, 1.645304], [42.557392, 1.644698], [42.558029, 1.644075], [42.559761, 1.643378]] },
    { nombre: "Rossinyol", dificultad: "principiante", color: "blue", puntos: [[42.552583, 1.628271], [42.549705, 1.623742], [42.547499, 1.621288], [42.546555, 1.620268], [42.545870, 1.616145], [42.547366, 1.616479], [42.548083, 1.617174], [42.548941, 1.616993], [42.549240, 1.615938], [42.550117, 1.614855], [42.549586, 1.614395], [42.551174, 1.613457], [42.551613, 1.613565], [42.553028, 1.613367]] },
    { nombre: "Miquel", dificultad: "experto", color: "red", puntos: [[42.548828, 1.646838], [42.552582, 1.649645], [42.554009, 1.649343], [42.556845, 1.648467], [42.558196, 1.645914], [42.558694, 1.645463], [42.560978, 1.643500]] }
];



const estadosPistas = {
    "Oreneta": { estado: "Abierta", nieve: "Polvo", gente: "Media", aviso: "Cuidado en el cruce" },
    "OS": { estado: "Abierta", nieve: "Polvo", gente: "Media", aviso: "Cuidado en el cruce" },
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



function guiarEntreSectores(nombreDestino) {
    const posActual = marcadorUsuario.getLatLng();
    const pistaDestino = pistas.find(p => p.nombre === nombreDestino);
    const panel = document.getElementById('instrucciones');

    if (!pistaDestino) return;

    // 1. Buscamos el remonte más cercano para empezar a subir
    const remonteInicial = encontrarRemonteMasCercano(posActual);
    
    // 2. Simulamos que al subir ese remonte, llegamos a una cota alta
    // Desde ahí, buscamos una pista que nos acerque al sector destino
    const pistaEnlace = encontrarPistaEnlace(remonteInicial.puntos[1], pistaDestino.puntos[0]);

    // 3. Renderizamos las instrucciones paso a paso
    panel.innerHTML = `
        <div style="padding:15px; background:#f8f9fa; border-left:5px solid #3498db; border-radius:8px;">
            <h4 style="margin-top:0;">🗺️ Ruta al Sector: ${nombreDestino}</h4>
            
            <p><strong>Paso 1:</strong> Sube por el remonte 🚠 <b>${remonteInicial.nombre}</b> (a ${Math.round(posActual.distanceTo(remonteInicial.puntos[0]))}m).</p>
            
            <p><strong>Paso 2:</strong> Al bajar, toma la pista ⛷️ <b>${pistaEnlace.nombre}</b> (${pistaEnlace.color}) para cruzar el valle.</p>
            
            <p><strong>Paso 3:</strong> Sigue las balizas hasta entrar en la pista final: 🏁 <b>${pistaDestino.nombre}</b>.</p>
            
            <button onclick="dibujarRutaCompleta('${remonteInicial.nombre}', '${pistaEnlace.nombre}', '${pistaDestino.nombre}')" 
                    style="background:#3498db; color:white; border:none; padding:8px; width:100%; border-radius:4px; cursor:pointer;">
                Ver mapa de conexión
            </button>
        </div>
    `;
}


// Busca el remonte más cercano a tu ubicación real
function encontrarRemonteMasCercano(latlng) {
    const remontes = pistas.filter(p => p.color === "yellow"); // Tus remontes son amarillos
    return remontes.reduce((prev, curr) => {
        const distPrev = latlng.distanceTo(L.latLng(prev.puntos[0]));
        const distCurr = latlng.distanceTo(L.latLng(curr.puntos[0]));
        return distCurr < distPrev ? curr : prev;
    });
}

// Busca qué pista nace cerca de donde te deja el remonte
function encontrarPistaEnlace(puntoDesembarque, puntoDestino) {
    const pistasEsqui = pistas.filter(p => p.color !== "yellow");
    return pistasEsqui.reduce((prev, curr) => {
        const distPrev = L.latLng(puntoDesembarque).distanceTo(L.latLng(prev.puntos[0]));
        const distCurr = L.latLng(puntoDesembarque).distanceTo(L.latLng(curr.puntos[0]));
        return distCurr < distPrev ? curr : prev;
    });
}



function dibujarRutaCompleta(idRemonte, idPistaEnlace, idDestino) {
    if (capaRutaActiva) map.removeLayer(capaRutaActiva);
    
    const r1 = pistas.find(p => p.nombre === idRemonte);
    const p1 = pistas.find(p => p.nombre === idPistaEnlace);
    const d1 = pistas.find(p => p.nombre === idDestino);

    // Creamos un grupo de líneas para mostrar el camino
    const rutaTotal = L.featureGroup([
        L.polyline(r1.puntos, {color: 'black', weight: 5, dashArray: '5, 10'}), // Remonte
        L.polyline(p1.puntos, {color: p1.color, weight: 8, opacity: 0.5}),      // Enlace
        L.polyline(d1.puntos, {color: '#2ecc71', weight: 12})                  // Destino final
    ]).addTo(map);

    capaRutaActiva = rutaTotal;
    map.fitBounds(rutaTotal.getBounds());
}
// --- LÓGICA DE NAVEGACIÓN ENTRE SECTORES ---

function guiarUsuario() {
    const nombreDestino = document.getElementById('destinoFinal').value;
    const panelInstrucciones = document.getElementById('debug-log'); // Usamos el log para instrucciones
    
    if (!nombreDestino) return;

    const pistaDestino = pistas.find(p => p.nombre === nombreDestino);
    const posActual = marcadorUsuario.getLatLng();

    if (pistaDestino) {
        // 1. Limpiar rutas anteriores
        if (capaRutaActiva) map.removeLayer(capaRutaActiva);

        // 2. BUSCAR EL REMONTE MÁS CERCANO (Para subir al sector)
        const remontes = pistas.filter(p => p.color === "yellow");
        const remonteCercano = remontes.reduce((prev, curr) => {
            const distPrev = posActual.distanceTo(L.latLng(prev.puntos[0]));
            const distCurr = posActual.distanceTo(L.latLng(curr.puntos[0]));
            return distCurr < distPrev ? curr : prev;
        });

        // 3. BUSCAR PISTA DE ENLACE (Para bajar hacia el destino)
        // Buscamos una pista que empiece cerca de donde termina el remonte
        const puntoCima = L.latLng(remonteCercano.puntos[1]);
        const pistasEsqui = pistas.filter(p => p.color !== "yellow");
        const enlace = pistasEsqui.reduce((prev, curr) => {
            const distPrev = puntoCima.distanceTo(L.latLng(prev.puntos[0]));
            const distCurr = puntoCima.distanceTo(L.latLng(curr.puntos[0]));
            return distCurr < distPrev ? curr : prev;
        });

        // 4. MOSTRAR INSTRUCCIONES EN EL PANEL
        panelInstrucciones.innerHTML = `
            <div style="background:#2c3e50; color:white; padding:10px; border-radius:5px; margin-top:10px;">
                <b style="color:#f1c40f">🗺️ PLAN DE RUTA A ${nombreDestino.toUpperCase()}:</b><br>
                1️⃣ Sube por: <b>${remonteCercano.nombre}</b> 🚠<br>
                2️⃣ Baja por enlace: <b>${enlace.nombre}</b> ⛷️<br>
                3️⃣ Llegada a: <b>${pistaDestino.nombre}</b> 🏁
            </div>
        `;

        // 5. DIBUJAR RUTA COMPLETA (Visual)
        const lineaRemonte = L.polyline(remonteCercano.puntos, {color: 'gray', weight: 4, dashArray: '5, 10'});
        const lineaEnlace = L.polyline(enlace.puntos, {color: enlace.color, weight: 6, opacity: 0.5});
        const lineaDestino = L.polyline(pistaDestino.puntos, {color: '#2ecc71', weight: 10});

        capaRutaActiva = L.featureGroup([lineaRemonte, lineaEnlace, lineaDestino]).addTo(map);
        map.fitBounds(capaRutaActiva.getBounds(), {padding: [50, 50]});

        // Simulación opcional
        setTimeout(() => {
            if(confirm(`Para ir a ${nombreDestino}, ¿quieres simular la ruta: ${remonteCercano.nombre} + ${enlace.nombre}?`)){
                const rutaTotal = [...remonteCercano.puntos, ...enlace.puntos, ...pistaDestino.puntos];
                simularDescenso(rutaTotal);
            }
        }, 500);
    }
}





// --- NUEVA FUNCIÓN: CLIC EN EL MAPA PARA NAVEGAR ---

map.on('click', function(e) {
    const latlngDestino = e.latlng;

    // 1. Crear un marcador temporal donde el usuario hizo clic
    if (window.marcadorDestinoTemporal) map.removeLayer(window.marcadorDestinoTemporal);
    window.marcadorDestinoTemporal = L.marker(latlngDestino, {
        icon: L.divIcon({className: 'destino-punto', html: '📍', iconSize: [30, 30]})
    }).addTo(map).bindPopup("<b>Destino seleccionado</b><br><button onclick='iniciarRutaAPuntoCustom()'>Ir aquí</button>").openPopup();

    // Guardamos las coordenadas para usarlas luego
    window.coordenadasDestinoClick = latlngDestino;
});

function iniciarRutaAPuntoCustom() {
    const posActual = marcadorUsuario.getLatLng();
    const posDestino = window.coordenadasDestinoClick;
    const panel = document.getElementById('debug-log');

    // 1. Buscamos el remonte más cercano a nuestra posición actual para empezar a subir
    const remontes = pistas.filter(p => p.color === "yellow");
    const remonteCercano = remontes.reduce((prev, curr) => {
        const distPrev = posActual.distanceTo(L.latLng(prev.puntos[0]));
        const distCurr = posActual.distanceTo(L.latLng(curr.puntos[0]));
        return distCurr < distPrev ? curr : prev;
    });

    // 2. Buscamos la pista más cercana al punto donde hicimos clic (el destino)
    const pistasEsqui = pistas.filter(p => p.color !== "yellow");
    const pistaFinal = pistasEsqui.reduce((prev, curr) => {
        const distPrev = posDestino.distanceTo(L.latLng(prev.puntos[prev.puntos.length - 1]));
        const distCurr = posDestino.distanceTo(L.latLng(curr.puntos[curr.puntos.length - 1]));
        return distCurr < distPrev ? curr : prev;
    });

    // 3. Dibujar la lógica en el mapa
    if (capaRutaActiva) map.removeLayer(capaRutaActiva);

    const rutaVisual = L.featureGroup([
        L.polyline(remonteCercano.puntos, {color: 'black', weight: 4, dashArray: '5, 10'}), // Subida
        L.polyline(pistaFinal.puntos, {color: '#2ecc71', weight: 8}) // Bajada
    ]).addTo(map);

    capaRutaActiva = rutaVisual;
    map.fitBounds(rutaVisual.getBounds());

    // 4. Instrucciones verbales
    panel.innerHTML = `
        <div style="background:#2c3e50; color:white; padding:10px; border-radius:5px;">
            <b>🚀 RUTA CALCULADA:</b><br>
            1. Dirígete al remonte <b>${remonteCercano.nombre}</b>.<br>
            2. Desde la cima, baja por la pista <b>${pistaFinal.nombre}</b> hasta tu destino.
        </div>
    `;
    
    map.closePopup();
}


function iniciarRutaAPuntoCustom() {
    const posActual = marcadorUsuario.getLatLng();
    const posDestino = window.coordenadasDestinoClick;
    const panel = document.getElementById('debug-log');

    const remontes = pistas.filter(p => p.color === "yellow");
    const pistasEsqui = pistas.filter(p => p.color !== "yellow");

    // 1. Identificar la PISTA OBJETIVO (donde hiciste clic)
    const pistaObjetivo = pistasEsqui.reduce((prev, curr) => {
        const distPrev = posDestino.distanceTo(L.latLng(curr.puntos[0]));
        return posDestino.distanceTo(L.latLng(curr.puntos[0])) < posDestino.distanceTo(L.latLng(prev.puntos[0])) ? curr : prev;
    });

    // 2. ¿Qué remonte llega a la cima de esa pista? (Remonte Final)
    const inicioPista = L.latLng(pistaObjetivo.puntos[0]);
    const remonteFinal = remontes.reduce((prev, curr) => {
        return inicioPista.distanceTo(L.latLng(curr.puntos[1])) < inicioPista.distanceTo(L.latLng(prev.puntos[1])) ? curr : prev;
    });

    // 3. ¿El remonte final está cerca de mí? Si no, buscamos un remonte de enlace
    const distAlRemonteFinal = posActual.distanceTo(L.latLng(remonteFinal.puntos[0]));
    let remonteInicial = null;

    if (distAlRemonteFinal > 500) { // Si el remonte final está a más de 500m, buscamos enlace
        remonteInicial = remontes.reduce((prev, curr) => {
            const distPrev = posActual.distanceTo(L.latLng(prev.puntos[0]));
            const distCurr = posActual.distanceTo(L.latLng(curr.puntos[0]));
            return (distCurr < distPrev && curr.nombre !== remonteFinal.nombre) ? curr : prev;
        });
    }

    // 4. DIBUJAR RUTA MULTI-ETAPA
    if (capaRutaActiva) map.removeLayer(capaRutaActiva);
    let capas = [];

    if (remonteInicial && remonteInicial.nombre !== remonteFinal.nombre) {
        // TRAMO 1: Primer remonte
        capas.push(L.polyline(remonteInicial.puntos, {color: '#f1c40f', weight: 4, dashArray: '5,10'}));
        // TRAMO 2: Conexión entre remontes
        capas.push(L.polyline([remonteInicial.puntos[1], remonteFinal.puntos[0]], {color: 'white', weight: 2, dashArray: '2,4'}));
        
        panel.innerHTML = `
            <div style="background:#2c3e50; color:white; padding:12px; border-radius:8px;">
                <b style="color:#f1c40f">🚠 RUTA CON ESCALA:</b><br>
                1. Sube por <b>${remonteInicial.nombre}</b>.<br>
                2. Al bajar, ve al enlace hacia <b>${remonteFinal.nombre}</b>.<br>
                3. Finalmente, baja por la pista <b>${pistaObjetivo.nombre}</b>.
            </div>`;
    } else {
        panel.innerHTML = `<div style="background:#2c3e50; color:white; padding:12px; border-radius:8px;">
            <b>🚠 RUTA DIRECTA:</b><br>
            Sube por <b>${remonteFinal.nombre}</b> y baja por <b>${pistaObjetivo.nombre}</b>.
        </div>`;
    }

    capas.push(L.polyline(remonteFinal.puntos, {color: '#f1c40f', weight: 6}));
    capas.push(L.polyline(pistaObjetivo.puntos, {color: pistaObjetivo.color, weight: 8}));

    capaRutaActiva = L.featureGroup(capas).addTo(map);
    map.fitBounds(capaRutaActiva.getBounds(), {padding: [50, 50]});
}


function calcularRutaCompleta(destinoNombre) {
    const posActual = marcadorUsuario.getLatLng();
    const panel = document.getElementById('debug-log');
    
    // Simulación de la ruta lógica que mencionaste:
    // 1. TC10 (Subida) -> 2. TSD Llosada (Subida) -> 3. Oreneta (Bajada) -> 4. TS Clots (Subida) -> 5. Rossinyol (Bajada corta) -> 6. TSD Portella
    
    let rutaLógica = [
        { tipo: 'subida', id: 'TC10-Tarter' },
        { tipo: 'subida', id: 'TSD-Llosada' },
        { tipo: 'bajada', id: 'Oreneta' },
        { tipo: 'subida', id: 'TS-Clots' },
        { tipo: 'bajada', id: 'Rossinyol' },
        { tipo: 'subida', id: 'TSD-Portella' }
    ];

    dibujarRutaEtapas(rutaLógica);

    panel.innerHTML = `
        <div style="background:#2c3e50; color:white; padding:15px; border-radius:10px; font-size:12px;">
            <b style="color:#f1c40f">🗺️ RUTA MULTI-SECTOR:</b><br>
            1. 🚠 Sube <b>TC10 Tarter</b><br>
            2. 🚠 Enlaza con <b>TSD Llosada</b><br>
            3. ⛷️ Baja por <b>Oreneta</b> hasta Clots<br>
            4. 🚠 Sube <b>TS Clots</b><br>
            5. ⛷️ Baja <b>Rossinyol</b> hacia Portella<br>
            6. 🚠 Toma <b>TSD Portella</b>.
        </div>
    `;
}

function dibujarRutaEtapas(etapas) {
    if (capaRutaActiva) map.removeLayer(capaRutaActiva);
    let grupo = L.featureGroup();

    etapas.forEach(etapa => {
        const dato = pistas.find(p => p.nombre === etapa.id);
        if (dato) {
            let color = etapa.tipo === 'subida' ? '#f1c40f' : dato.color;
            let dash = etapa.tipo === 'subida' ? '5, 10' : '';
            let peso = etapa.tipo === 'subida' ? 5 : 8;

            let linea = L.polyline(dato.puntos, {
                color: color,
                weight: peso,
                dashArray: dash,
                opacity: 0.9
            });
            grupo.addLayer(linea);
        }
    });

    capaRutaActiva = grupo.addTo(map);
    map.fitBounds(grupo.getBounds(), {padding: [50, 50]});
}


function calcularRutaAvanzada(inicio, fin) {
    // Ejemplo de ruta lógica para ir de abajo (Tarter) a Portella
    // 1. TC10-Tarter (Subida)
    // 2. TSD-Llosada (Subida)
    // 3. Oreneta (Bajada hasta Clots)
    // 4. TS-Clots (Subida)
    // 5. Rossinyol (Bajada hasta Portella)
    // 6. TSD-Portella (Subida final)

    const itinerario = [
        "TC10-Tarter", 
        "TSD-Llosada", 
        "Oreneta", 
        "TS-Clots", 
        "Rossinyol", 
        "TSD-Portella"
    ];

    dibujarItinerario(itinerario);
}

function dibujarItinerario(listaNombres) {
    if (capaRutaActiva) map.removeLayer(capaRutaActiva);
    let grupo = L.featureGroup();
    let htmlPasos = "<b>🚩 HOJA DE RUTA:</b><br><ol>";

    listaNombres.forEach((nombre, index) => {
        const tramo = pistas.find(p => p.nombre === nombre);
        if (tramo) {
            const esRemonte = tramo.color === "yellow";
            
            // Estilo visual diferenciado
            const estilo = {
                color: esRemonte ? "#f1c40f" : tramo.color,
                weight: esRemonte ? 6 : 8,
                dashArray: esRemonte ? "10, 10" : "",
                opacity: 0.8
            };

            grupo.addLayer(L.polyline(tramo.puntos, estilo));
            
            // Añadir al panel lateral
            const icono = esRemonte ? "🚠" : "⛷️";
            htmlPasos += `<li>${icono} ${nombre}</li>`;
        }
    });

    htmlPasos += "</ol>";
    document.getElementById('debug-log').innerHTML = htmlPasos;
    
    capaRutaActiva = grupo.addTo(map);
    map.fitBounds(grupo.getBounds(), {padding: [50, 50]});
}


function calcularRutaMaestra(nombreDestino) {
    const panel = document.getElementById('debug-log');
    
    // Definimos la "Línea Maestra" de El Tarter a Portella
    const rutaCompleta = [
        "TC10-Tarter",   // 1. Subir al sector 2000
        "TSD-Llosada",  // 2. Subir a la Tosa
        "Oreneta",      // 3. Bajar hacia el valle de Clots
        "TS-Clots",     // 4. Subir para saltar la loma
        "Rossinyol",    // 5. Bajar hacia el sector Portella
        "TSD-Portella"  // 6. Remonte final
    ];

    if (capaRutaActiva) map.removeLayer(capaRutaActiva);
    let grupoCapas = L.featureGroup();
    let listaHTML = "<b>🧭 NAVEGACIÓN ACTIVA:</b><ol>";

    rutaCompleta.forEach((id) => {
        const tramo = pistas.find(p => p.nombre === id);
        if (tramo) {
            const esRemonte = tramo.color === "yellow";
            
            // Dibujamos el tramo con estilo específico
            const linea = L.polyline(tramo.puntos, {
                color: esRemonte ? "#f1c40f" : tramo.color,
                weight: esRemonte ? 6 : 9,
                dashArray: esRemonte ? "10, 15" : "",
                opacity: 0.8
            }).addTo(grupoCapas);

            listaHTML += `<li>${esRemonte ? '🚠' : '⛷️'} ${id}</li>`;
        }
    });

    listaHTML += "</ol><b>¡Sigue las balizas!</b>";
    panel.innerHTML = listaHTML;
    
    capaRutaActiva = grupoCapas.addTo(map);
    map.fitBounds(grupoCapas.getBounds(), {padding: [50, 50]});
}

//function guiarUsuario() {
    /* const destino = document.getElementById('destinoFinal').value;
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
//}
 */



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

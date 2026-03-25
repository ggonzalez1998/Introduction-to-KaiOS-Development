# Introduction-to-KaiOS-Development
A beginner-friendly guide and code examples for developing applications for KaiOS, the OS powering smart feature phones.

![KaiOS Compatibility](https://img.shields.io/badge/KaiOS-2.5%20%7C%203.0-6F02B5?style=for-the-badge&logo=kaios)
![Build Size](https://img.shields.io/badge/Build_Size-<20MB-brightgreen?style=for-the-badge)
![Monetization](https://img.shields.io/badge/Monetization-KaiAds_SDK-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-PFG_Project-blue?style=for-the-badge)

Aquí encontrarás desde cómo saltarse las restricciones del fabricante (OEM) para activar el modo desarrollador, hasta proyectos prácticos open-source interactuando con el hardware del móvil.

## 📑 Tabla de Contenidos
1. [Introducción al Ecosistema KaiOS](#1-introducción-al-ecosistema-kaios)
2. [Entorno de Desarrollo y Debugging](#2-entorno-de-desarrollo-y-debugging)
3. [Diferencias Arquitectónicas: KaiOS 2.5 vs 3.0](#3-diferencias-arquitectónicas)
4. [Buenas Prácticas, UI y UX (D-Pad)](#4-buenas-prácticas-ui-y-ux)
5. [Proyectos de Hardware (Apps de Ejemplo)](#5-proyectos-de-hardware-apps-de-ejemplo)
6. [Publicación y Monetización](#6-publicación-y-monetización)
7. [Ideas para Futuras Aplicaciones](#7-ideas-para-futuras-aplicaciones)
8. [Créditos y Referencias](#8-créditos-y-referencias)


## 1. Introducción al Ecosistema KaiOS


KaiOS es un sistema operativo móvil basado en web, diseñado para teléfonos con teclado físico (T9) y cruceta direccional (D-pad), operando con hardware muy limitado (256MB - 512MB RAM). Desarrollar aquí exige dominar tecnologías web modernas (HTML5, CSS, JS) bajo una optimización de rendimiento extrema.

Para el desarrollo hay dos vías principales:
1. **Simulador WebIDE:** Útil para la interfaz, pero limitado para probar componentes de hardware reales.
2. **Dispositivo Físico (Recomendado):** Activar el modo *Developer*, conectar por ADB e instalar apps de terceros vía WebIDE (usando Waterfox Classic) o mediante *OmniSD / Wallace Toolbox*.


## 2. Entorno de Desarrollo y Debugging


El mayor obstáculo en KaiOS es acceder al menú de desarrollo. Esto depende del chipset de tu móvil:

- **Qualcomm-based:** Simplemente marca `*#*#33284#*#*` para activar las herramientas.
- **Spreadtrum-based:** Marca el código anterior y luego `*#*#0574#*#*` para activar el USB debugger.
- **Mediatek-based (Ej. Blackview N1000 con MT6739):** Requiere un método avanzado llamado **Cache Injection**.

<details>
<summary><b>🛠️ Ver Tutorial Paso a Paso: Cache Injection en MediaTek (Blackview N1000)</b></summary>

El *Cache Injection* burla el bloqueo de fábrica inyectando archivos modificados en las particiones del sistema usando `Fastboot`.

**1. Preparación en Linux (Ubuntu/Debian):**
```bash
sudo apt install git build-essential curl libssl-dev python3-pip -y
git clone [https://github.com/bkerler/mtkclient](https://github.com/bkerler/mtkclient) --recursive
```
Instala las dependencias y Pyenv (Python 3.10+ recomendado). Asegúrate de configurar las reglas udev y añadir tu usuario a los grupos dialout y plugdev.

**2. Desbloqueo y Flasheo con MTKClient:**

-Abre la app MTKClient, ve a la pestaña "Herramienta Flash" y haz clic en "Desbloquear" para liberar el Fastboot.
-Ve a "Escribir la(s) particion(es)" y selecciona las imágenes .bin modificadas (obtenidas en foros de desarrollo) para las particiones de cache y boot.

**3. Reinicio y Uso:**
Tras escribir las particiones, reinicia el dispositivo. El sistema leerá la caché inyectada y habilitará el menú "Desarrollador" en los Ajustes, permitiendo el uso de ADB.

-Conexión vía Waterfox Classic y WebIDE
Para instalar las aplicaciones, usamos Waterfox Classic. Ejecuta el siguiente comando en tu terminal para redirigir los puertos:
```bash
adb forward tcp:6000 localfilesystem:/data/local/debugger-socket
```
En WebIDE, selecciona "Remote Runtime", conéctate al puerto 6000 y podrás depurar en vivo e instalar tus paquetes ZIP.
</details>

## 3. Diferencias Arquitectónicas: KaiOS 2.5 vs 3.0
Es vital conocer a qué versión apuntas:
| Característica | KaiOS 2.5 (Gecko 48) | KaiOS 3.0 (Gecko 84) |
| ------------- | ------------- | ------------- |
| Estructura  | Packaged App (ZIP) con `manifest.webapp`  | PWA estándar con `manifest.webapp` manifest.webmanifest |
| WASM  | No soportado (Usa `asm.js`) | Soportado nativamente  |
| API de Apps | Proprietary `mozApps` API  | Web API Apps Manager estándar  |
| DevTools  | Accesible vía hacks / códigos  | Completamente bloqueado en móviles comerciales  |


## 4. Buenas Prácticas, UI y UX


En KaiOS no hay pantallas táctiles. Todo depende del DOM Focus y la manipulación matemática del scroll.

✅ LO QUE DEBES HACER:

-Apps Pequeñas: Menos de 4MB es ideal. Minifica tu JS/CSS.

-Foco Claro: Usa CSS (`:focus`) para destacar elementos fuertemente (Ej. inversión de colores, bordes gruesos).

-Gestión de D-Pad: Captura `ArrowUp`, `ArrowDown`, `SoftLeft`, `SoftRight` e interactúa usando `document.activeElement`.

-Theme Color: Usa `<meta name="theme-color" content="rgb(255, 255, 255)" />` (con espacios) para que el Status Bar cambie de color inteligentemente.

❌ LO QUE NO DEBES HACER:

-Animar propiedades complejas (cíñete a `transform` y `opacity` para evitar cuelgues por falta de memoria RAM).

-Exceder el límite de 5MB de `localStorage`.

-Usar frameworks pesados (React, Angular). Prefiere Vanilla JS, Svelte o Preact.

-Depender del cursor emulado (`"cursor": true`). Es lento y frustrante.


## 5. Proyectos de Hardware (Apps de Ejemplo)


En el directorio `HARDWARE APPS` he desarrollado 6 aplicaciones prácticas demostrando cómo interactuar con los sensores y el hardware del móvil. Todas implementan una solución de **"Scroll Matemático"** propio para mantener siempre la vista centrada en el elemento activo.

🎙️ [**1. AudioApp (KaiVoice)**](HARDWARE APPS/AudioApp)

App de grabación de voz con guardado permanente.

**-Permisos:** `audio-capture`, `device-storage:music`.

**-Funcionalidad:** Captura el micrófono mediante `MediaRecorder`, genera un Blob en formato OGG y lo guarda en la tarjeta SD o memoria interna usando `navigator.getDeviceStorage`.

🎥 Ver Demo (Próximamente)

📸 [**2. CameraApp (KaiCam)**](HARDWARE APPS/CameraApp)

Visor en vivo de la cámara y captura fotográfica.

**-Permisos:** `camera`, `video-capture`, `device-storage:pictures`.

**-Funcionalidad:** Renderiza el `getUserMedia` en una etiqueta `<video>`, dibuja el frame exacto en un `canvas` oculto y lo exporta a un JPEG directo a la galería del usuario.

🎥 Ver Demo (Próximamente)

**🔦 [3. FlashlightApp (Flashlight Pro)**](HARDWARE APPS/FlashlightAndVibration)

Control robusto del LED flash.

**-Permisos:** Privilegio `certified` requerido, `flashlight`.

**-Funcionalidad:** Implementa métodos duales de control (usando `navigator.mozFlashlight` o `setTorch`). Mantiene sincronización visual con el estado de hardware real e incluye vibración háptica.

🎥 Ver Demo (Próximamente)

**🧭 [4. KeyBoardApp (KaiNav Guide)**](HARDWARE APPS/KeyBoardNavigation)

La guía definitiva de navegación por teclado para interfaces complejas.

**-Funcionalidad:** Demuestra el uso avanzado de matrices (NavMaps) para navegar con el D-pad. Destaca el algoritmo de centrado perfecto de vista (`offsetTop - contentHeight / 2 + itemHeight / 2`), evitando bloqueos en la interfaz.

🎥 Ver Demo (Próximamente)

**⚙️ [5. SystemApp (KaiSystem)**](HARDWARE APPS/SystemApp)

Herramienta de diagnóstico para leer sensores del sistema.

**-Permisos:** `device-storage:sdcard`.

**-Funcionalidad:** Extrae y muestra en tiempo real datos de la API de Batería (`mozBattery`), tipo de conexión de Red y calcula el espacio de almacenamiento libre mediante solicitudes asíncronas de la SD.

🎥 Ver Demo (Próximamente)

**📍 [6. TrackingApp (KaiTracking)**](HARDWARE APPS/TrackingGPS)

Rastreador GPS en tiempo real con Reverse Geocoding y SMS.

**-Permisos:** `geolocation`, `systemXHR`.

**-Funcionalidad:** Activa el GPS (`watchPosition`). Hace peticiones seguras (`systemXHR`) a Nominatim (OpenStreetMap) para convertir coordenadas en nombres de calles. Utiliza `MozActivity` para abrir la app nativa de SMS y compartir la ubicación en un link.

🎥 Ver Demo (Próximamente)


## 6. Publicación y Monetización


Publicar en la KaiStore o JioStore requiere cumplir normativas estrictas de diseño:

**-Iconos:** Obligatorio 56x56 y 112x112 px (recomendable aplicar sombra paralela).

**-Banner de Marketing:** 240x130 px (JPG no transparente).

**-Screenshots:** Hasta 5 imágenes de 240x320 px sin iconos de debug en la barra superior.

**-Monetización:** Si publicas en KaiStore, debes incluir obligatoriamente el SDK de KaiAds. (El reparto de beneficios es 30% dev / 70% Kai, con umbral mínimo de pago de 500$).

**Nota sobre Actividades Web (Intents):** Puedes aprovechar las `MozActivity` (KaiOS 2.5) o `WebActivity` (KaiOS 3.0) para abrir enlaces, ajustar configuraciones de red o compartir archivos, enriqueciendo la experiencia sin reinventar la rueda.


## 7. Ideas para Futuras Aplicaciones


Basadas en el análisis de *Tom Barrasso* sobre nichos vacíos en KaiStore:

**-Bloqueador de Robocalls:** App `certified` usando APIs de telefonía para bloquear SPAM.

**-Sincronización de Archivos (FTP/WebDAV):** Transferir datos sin necesidad de extraer la tarjeta SD físicamente.

**-Radar Meteorológico en Vivo:** Usando canvas o Leaflet para mostrar precipitación (actualmente casi inexistente en la plataforma).

**-Portapapeles Avanzado (Stash):** Ya que KaiOS carece de "Copiar y Pegar" global, una app centralizada de recortes a la que enviar texto vía Web Activities.


## 8. Créditos y Referencias


Gran parte del conocimiento recopilado en esta guía ha sido extraído e inspirado por la increíble comunidad y los siguientes pioneros:

-[Tom Barrasso (KaiOS.dev)](https://kaios.dev/) - Liderazgo en DevRel e información técnica detallada sobre APIs.

-[BananaHackers Community](https://sites.google.com/view/bananahackers) - Procedimientos de Jailbreak, OmniSD, y Wiki de dispositivos.

-Usuario de Foros [4PDA](https://4pda.to/forum/index.php?showtopic=1091871&st=160#entry134653032) por las imágenes de Cache Injection del Blackview N1000.

-[MTKClient (Bkerler)](https://github.com/bkerler/mtkclient) por la herramienta de flasheo MediaTek.

-Descarga de [Waterfox Classic](https://classic.waterfox.net/).



**Proyecto creado por [Guillermo González Martín (@ggonzalez1998)](https://github.com/ggonzalez1998) para el Trabajo de Fin de Grado.**

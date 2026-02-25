import fs from 'fs';
import path from 'path';

const outDir = path.resolve('data');

const categories = [
  { id: 'basics', name: 'Everyday Basics', description: 'Core daily words and useful phrases.' },
  { id: 'food', name: 'Food and Dining', description: 'Food, drinks, dining actions, and restaurant phrases.' },
  { id: 'travel', name: 'Travel and Transport', description: 'Transport, places, directions, and travel phrases.' },
  { id: 'home', name: 'Home and Household', description: 'Objects, chores, rooms, and household phrases.' },
  { id: 'work', name: 'Work and School', description: 'Office, school, meetings, and productivity phrases.' },
  { id: 'health', name: 'Health and Body', description: 'Body, symptoms, wellbeing, and medical phrases.' },
];

const basicsWords = [
  ['hola', 'hello'], ['adios', 'goodbye'], ['hasta luego', 'see you later'], ['por favor', 'please'],
  ['gracias', 'thank you'], ['de nada', 'you are welcome'], ['lo siento', 'sorry'], ['perdon', 'excuse me'],
  ['si', 'yes'], ['no', 'no'], ['quizas', 'maybe'], ['claro', 'of course'], ['vale', 'okay'],
  ['hoy', 'today'], ['manana', 'tomorrow'], ['ayer', 'yesterday'], ['ahora', 'now'], ['luego', 'later'],
  ['siempre', 'always'], ['nunca', 'never'], ['a veces', 'sometimes'], ['mucho', 'a lot'],
  ['poco', 'a little'], ['mas', 'more'], ['menos', 'less'], ['grande', 'big'], ['pequeno', 'small'],
  ['nuevo', 'new'], ['viejo', 'old'], ['bueno', 'good'], ['malo', 'bad'], ['facil', 'easy'],
  ['dificil', 'difficult'], ['rapido', 'fast'], ['lento', 'slow'], ['caliente', 'hot'], ['frio', 'cold'],
  ['amigo', 'friend'], ['familia', 'family'], ['casa', 'house'], ['calle', 'street'], ['coche', 'car'],
  ['dinero', 'money'], ['tiempo', 'time'], ['nombre', 'name'], ['pregunta', 'question'], ['respuesta', 'answer'],
  ['izquierda', 'left'], ['derecha', 'right'], ['arriba', 'up'], ['abajo', 'down'], ['cerca', 'near'], ['lejos', 'far'],
  ['primero', 'first'], ['ultimo', 'last'], ['antes', 'before'], ['despues', 'after'], ['porque', 'because'],
  ['entonces', 'then'], ['solo', 'only'], ['tambien', 'also'], ['nada', 'nothing'], ['todo', 'everything'],
];

const basicsPhraseSubjects = [
  ['yo', 'I'], ['tu', 'you'], ['usted', 'you (formal)'], ['nosotros', 'we'], ['vosotros', 'you all'], ['ellos', 'they'],
];
const basicsPhraseVerbs = [
  ['necesito', 'need'], ['quiero', 'want'], ['puedo', 'can'], ['debo', 'must'], ['prefiero', 'prefer'], ['entiendo', 'understand'],
  ['busco', 'am looking for'], ['recuerdo', 'remember'], ['olvido', 'forget'], ['aprendo', 'learn'],
];
const basicsObjects = [
  ['ayuda', 'help'], ['agua', 'water'], ['informacion', 'information'], ['un descanso', 'a break'], ['el billete', 'the ticket'],
  ['la direccion', 'the address'], ['la clave', 'the password'], ['la respuesta', 'the answer'], ['el numero', 'the number'], ['el mapa', 'the map'],
];

const foodWords = [
  ['pan', 'bread'], ['arroz', 'rice'], ['pasta', 'pasta'], ['huevo', 'egg'], ['queso', 'cheese'],
  ['leche', 'milk'], ['mantequilla', 'butter'], ['aceite', 'oil'], ['sal', 'salt'], ['azucar', 'sugar'],
  ['pimienta', 'pepper'], ['pollo', 'chicken'], ['ternera', 'beef'], ['cerdo', 'pork'], ['pescado', 'fish'],
  ['marisco', 'seafood'], ['ensalada', 'salad'], ['sopa', 'soup'], ['patata', 'potato'], ['tomate', 'tomato'],
  ['cebolla', 'onion'], ['ajo', 'garlic'], ['zanahoria', 'carrot'], ['manzana', 'apple'], ['platano', 'banana'],
  ['naranja', 'orange'], ['fresa', 'strawberry'], ['uva', 'grape'], ['agua', 'water'], ['zumo', 'juice'],
  ['cafe', 'coffee'], ['te', 'tea'], ['cerveza', 'beer'], ['vino', 'wine'], ['desayuno', 'breakfast'],
  ['almuerzo', 'lunch'], ['cena', 'dinner'], ['postre', 'dessert'], ['camarero', 'waiter'], ['cuenta', 'bill'],
  ['menu', 'menu'], ['cuchara', 'spoon'], ['tenedor', 'fork'], ['cuchillo', 'knife'], ['plato', 'plate'],
  ['vaso', 'glass'], ['taza', 'cup'], ['botella', 'bottle'], ['servilleta', 'napkin'], ['restaurante', 'restaurant'],
];
const foodActions = [
  ['quiero', 'I want'], ['prefiero', 'I prefer'], ['tomo', 'I take'], ['pido', 'I order'], ['como', 'I eat'], ['bebo', 'I drink'],
  ['necesito', 'I need'], ['pruebo', 'I try'], ['comparto', 'I share'], ['cocino', 'I cook'],
];
const foodObjects = [
  ['una mesa', 'a table'], ['el menu', 'the menu'], ['la cuenta', 'the bill'], ['agua sin gas', 'still water'],
  ['agua con gas', 'sparkling water'], ['una tapa', 'a tapa'], ['el plato del dia', 'the dish of the day'], ['un cafe solo', 'an espresso'],
  ['un cafe con leche', 'coffee with milk'], ['una cerveza fria', 'a cold beer'], ['una botella de vino', 'a bottle of wine'],
  ['pan extra', 'extra bread'], ['una ensalada', 'a salad'], ['una sopa', 'a soup'], ['un postre', 'a dessert'],
];

const travelWords = [
  ['aeropuerto', 'airport'], ['estacion', 'station'], ['parada', 'stop'], ['tren', 'train'], ['autobus', 'bus'],
  ['metro', 'subway'], ['taxi', 'taxi'], ['avion', 'plane'], ['vuelo', 'flight'], ['equipaje', 'luggage'],
  ['maleta', 'suitcase'], ['pasaporte', 'passport'], ['billete', 'ticket'], ['andén', 'platform'], ['puerta', 'gate'],
  ['mapa', 'map'], ['ruta', 'route'], ['calle', 'street'], ['avenida', 'avenue'], ['plaza', 'square'],
  ['hotel', 'hotel'], ['hostal', 'guesthouse'], ['reserva', 'reservation'], ['habitacion', 'room'], ['llave', 'key'],
  ['playa', 'beach'], ['montana', 'mountain'], ['museo', 'museum'], ['entrada', 'entrance ticket'], ['salida', 'exit'],
  ['izquierda', 'left'], ['derecha', 'right'], ['recto', 'straight ahead'], ['cerca', 'near'], ['lejos', 'far'],
  ['cruce', 'intersection'], ['puente', 'bridge'], ['carretera', 'road'], ['ciudad', 'city'], ['pueblo', 'town'],
  ['viaje', 'trip'], ['turista', 'tourist'], ['guia', 'guide'], ['horario', 'schedule'], ['retraso', 'delay'],
  ['cancelacion', 'cancellation'], ['asiento', 'seat'], ['ventanilla', 'window seat'], ['pasillo', 'aisle seat'], ['destino', 'destination'],
];
const travelTemplates = [
  ['donde esta {obj}', 'where is {objEn}'],
  ['como llego a {obj}', 'how do I get to {objEn}'],
  ['quiero ir a {obj}', 'I want to go to {objEn}'],
  ['a que hora sale {obj}', 'what time does {objEn} leave'],
  ['cuanto cuesta {obj}', 'how much does {objEn} cost'],
  ['tengo una reserva en {obj}', 'I have a reservation at {objEn}'],
];
const travelObjects = [
  ['la estacion', 'the station'], ['el aeropuerto', 'the airport'], ['el hotel', 'the hotel'], ['el museo', 'the museum'],
  ['la playa', 'the beach'], ['el centro', 'the center'], ['la parada', 'the stop'], ['la taquilla', 'the ticket office'],
  ['la puerta de embarque', 'the boarding gate'], ['el andén', 'the platform'], ['la recepcion', 'the reception'],
  ['el baño', 'the bathroom'], ['el mapa', 'the map'], ['el autobus', 'the bus'], ['el metro', 'the subway'],
];
const travelActions = [
  ['busco', 'I am looking for'],
  ['encuentro', 'I find'],
  ['visito', 'I visit'],
  ['reservo', 'I book'],
  ['confirmo', 'I confirm'],
  ['cambio', 'I change'],
  ['pierdo', 'I lose'],
  ['recojo', 'I pick up'],
  ['facturo', 'I check in'],
  ['espero en', 'I wait at'],
];

const homeWords = [
  ['cocina', 'kitchen'], ['salon', 'living room'], ['dormitorio', 'bedroom'], ['bano', 'bathroom'], ['pasillo', 'hallway'],
  ['puerta', 'door'], ['ventana', 'window'], ['llave', 'key'], ['mesa', 'table'], ['silla', 'chair'],
  ['sofa', 'sofa'], ['cama', 'bed'], ['armario', 'wardrobe'], ['espejo', 'mirror'], ['lampara', 'lamp'],
  ['alfombra', 'rug'], ['estanteria', 'shelf'], ['nevera', 'fridge'], ['horno', 'oven'], ['microondas', 'microwave'],
  ['lavadora', 'washing machine'], ['secadora', 'dryer'], ['fregadero', 'sink'], ['grifo', 'tap'], ['ducha', 'shower'],
  ['toalla', 'towel'], ['jabon', 'soap'], ['champu', 'shampoo'], ['cepillo', 'brush'], ['manta', 'blanket'],
  ['almohada', 'pillow'], ['sabana', 'sheet'], ['enchufe', 'plug socket'], ['cargador', 'charger'], ['basura', 'trash'],
  ['cubierta', 'cutlery'], ['plato', 'plate'], ['vaso', 'glass'], ['taza', 'cup'], ['sarten', 'frying pan'],
  ['olla', 'pot'], ['detergente', 'detergent'], ['escoba', 'broom'], ['fregona', 'mop'], ['aspiradora', 'vacuum cleaner'],
  ['limpio', 'clean'], ['sucio', 'dirty'], ['ordenado', 'tidy'], ['desordenado', 'messy'], ['hogar', 'home'],
];
const homeTasks = [
  ['limpio', 'I clean'], ['ordeno', 'I tidy'], ['friego', 'I wash'], ['barro', 'I sweep'], ['paso la aspiradora', 'I vacuum'],
  ['hago la cama', 'I make the bed'], ['saco la basura', 'I take out the trash'], ['abro', 'I open'], ['cierro', 'I close'], ['arreglo', 'I fix'],
];
const homeObjects = [
  ['la cocina', 'the kitchen'], ['el salon', 'the living room'], ['el dormitorio', 'the bedroom'], ['el baño', 'the bathroom'],
  ['la ventana', 'the window'], ['la puerta', 'the door'], ['la mesa', 'the table'], ['el sofa', 'the sofa'],
  ['la nevera', 'the fridge'], ['el horno', 'the oven'], ['la lavadora', 'the washing machine'], ['el fregadero', 'the sink'],
  ['el suelo', 'the floor'], ['la estanteria', 'the shelf'], ['el armario', 'the wardrobe'],
];

const workWords = [
  ['oficina', 'office'], ['trabajo', 'work'], ['reunion', 'meeting'], ['equipo', 'team'], ['proyecto', 'project'],
  ['tarea', 'task'], ['plazo', 'deadline'], ['correo', 'email'], ['mensaje', 'message'], ['llamada', 'call'],
  ['cliente', 'client'], ['proveedor', 'supplier'], ['jefe', 'boss'], ['compañero', 'coworker'], ['empleado', 'employee'],
  ['documento', 'document'], ['informe', 'report'], ['presentacion', 'presentation'], ['agenda', 'calendar'], ['horario', 'schedule'],
  ['objetivo', 'goal'], ['resultado', 'result'], ['problema', 'problem'], ['solucion', 'solution'], ['idea', 'idea'],
  ['presupuesto', 'budget'], ['contrato', 'contract'], ['factura', 'invoice'], ['pago', 'payment'], ['venta', 'sale'],
  ['compra', 'purchase'], ['clase', 'class'], ['escuela', 'school'], ['universidad', 'university'], ['examen', 'exam'],
  ['deberes', 'homework'], ['estudio', 'study'], ['nota', 'grade'], ['pregunta', 'question'], ['respuesta', 'answer'],
  ['ordenador', 'computer'], ['teclado', 'keyboard'], ['pantalla', 'screen'], ['archivo', 'file'], ['carpeta', 'folder'],
  ['impresora', 'printer'], ['internet', 'internet'], ['contraseña', 'password'], ['formacion', 'training'], ['descanso', 'break'],
];
const workActions = [
  ['necesito', 'I need'], ['termino', 'I finish'], ['empiezo', 'I start'], ['reviso', 'I review'], ['envio', 'I send'],
  ['recibo', 'I receive'], ['organizo', 'I organize'], ['programo', 'I schedule'], ['participo en', 'I take part in'], ['preparo', 'I prepare'],
];
const workObjects = [
  ['la reunion', 'the meeting'], ['el proyecto', 'the project'], ['el informe', 'the report'], ['la presentacion', 'the presentation'],
  ['el correo', 'the email'], ['la llamada', 'the call'], ['la tarea', 'the task'], ['el examen', 'the exam'],
  ['los deberes', 'the homework'], ['el documento', 'the document'], ['la agenda', 'the calendar'], ['el archivo', 'the file'],
  ['el presupuesto', 'the budget'], ['el contrato', 'the contract'], ['la factura', 'the invoice'],
];

const healthWords = [
  ['cabeza', 'head'], ['ojo', 'eye'], ['oreja', 'ear'], ['nariz', 'nose'], ['boca', 'mouth'],
  ['diente', 'tooth'], ['cuello', 'neck'], ['hombro', 'shoulder'], ['brazo', 'arm'], ['mano', 'hand'],
  ['dedo', 'finger'], ['pecho', 'chest'], ['espalda', 'back'], ['estomago', 'stomach'], ['pierna', 'leg'],
  ['rodilla', 'knee'], ['pie', 'foot'], ['corazon', 'heart'], ['sangre', 'blood'], ['salud', 'health'],
  ['medico', 'doctor'], ['enfermera', 'nurse'], ['farmacia', 'pharmacy'], ['hospital', 'hospital'], ['cita', 'appointment'],
  ['medicina', 'medicine'], ['pastilla', 'pill'], ['jarabe', 'syrup'], ['inyeccion', 'injection'], ['receta', 'prescription'],
  ['fiebre', 'fever'], ['tos', 'cough'], ['dolor', 'pain'], ['mareo', 'dizziness'], ['nauseas', 'nausea'],
  ['cansancio', 'fatigue'], ['frio', 'cold (illness)'], ['gripe', 'flu'], ['alergia', 'allergy'], ['herida', 'wound'],
  ['sano', 'healthy'], ['enfermo', 'sick'], ['descanso', 'rest'], ['sueño', 'sleep'], ['agua', 'water'],
  ['ejercicio', 'exercise'], ['respirar', 'to breathe'], ['caminar', 'to walk'], ['comer sano', 'eat healthy'], ['bienestar', 'wellbeing'],
];
const healthPhrases = [
  ['me duele {obj}', 'my {objEn} hurts'],
  ['tengo dolor de {obj}', 'I have {objEn} pain'],
  ['necesito {obj}', 'I need {objEn}'],
  ['quiero pedir {obj}', 'I want to ask for {objEn}'],
  ['me encuentro {adj}', 'I feel {adjEn}'],
  ['debo tomar {obj}', 'I should take {objEn}'],
];
const healthObjects = [
  ['la cabeza', 'head'], ['el estomago', 'stomach'], ['la espalda', 'back'], ['la pierna', 'leg'], ['la rodilla', 'knee'],
  ['el brazo', 'arm'], ['medicina', 'medicine'], ['una pastilla', 'a pill'], ['agua', 'water'], ['descanso', 'rest'],
  ['una cita medica', 'a doctor appointment'], ['una receta', 'a prescription'], ['jarabe', 'syrup'], ['ejercicio', 'exercise'], ['ayuda', 'help'],
];
const healthAdjectives = [
  ['mejor', 'better'], ['peor', 'worse'], ['cansado', 'tired'], ['mareado', 'dizzy'], ['bien', 'well'], ['mal', 'bad'],
];
const healthActions = [
  ['necesito', 'I need'],
  ['tomo', 'I take'],
  ['evito', 'I avoid'],
  ['cuido', 'I take care of'],
  ['muevo', 'I move'],
  ['descanso', 'I rest'],
  ['reviso', 'I check'],
  ['mejoro', 'I improve'],
  ['consulto', 'I consult'],
  ['anoto', 'I note'],
];

function toCsv(rows) {
  return rows.map((row) => row.map((cell) => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replaceAll('"', '""')}"`;
    }
    return str;
  }).join(',')).join('\n') + '\n';
}

function createRows(seedWords, templates = [], templateObjects = [], extra = {}) {
  const rows = [];
  let idx = 1;

  for (const [es, en] of seedWords) {
    rows.push({ id: `w_${String(idx).padStart(4, '0')}`, spanish: es, english: en, type: 'word' });
    idx += 1;
  }

  const addTemplateRows = () => {
    if (!templates.length || !templateObjects.length) return;
    for (const [esTemplate, enTemplate] of templates) {
      for (const [obj, objEn] of templateObjects) {
        rows.push({
          id: `w_${String(idx).padStart(4, '0')}`,
          spanish: esTemplate.replaceAll('{obj}', obj).replaceAll('{adj}', extra.adj?.[0]?.[0] || ''),
          english: enTemplate.replaceAll('{objEn}', objEn).replaceAll('{adjEn}', extra.adj?.[0]?.[1] || ''),
          type: 'phrase',
        });
        idx += 1;
      }
    }
  };

  addTemplateRows();

  if (extra.subjects && extra.verbs && extra.objects) {
    for (const [subject, subjectEn] of extra.subjects) {
      for (const [verb, verbEn] of extra.verbs) {
        for (const [obj, objEn] of extra.objects) {
          rows.push({
            id: `w_${String(idx).padStart(4, '0')}`,
            spanish: `${subject} ${verb} ${obj}`,
            english: `${subjectEn} ${verbEn} ${objEn}`,
            type: 'phrase',
          });
          idx += 1;
        }
      }
    }
  }

  if (extra.actions && extra.objects2) {
    for (const [action, actionEn] of extra.actions) {
      for (const [obj, objEn] of extra.objects2) {
        rows.push({
          id: `w_${String(idx).padStart(4, '0')}`,
          spanish: `${action} ${obj}`,
          english: `${actionEn} ${objEn}`,
          type: 'phrase',
        });
        idx += 1;
      }
    }
  }

  if (extra.phrases && extra.objects3) {
    for (const [phraseEs, phraseEn] of extra.phrases) {
      for (const [obj, objEn] of extra.objects3) {
        const eAdj = extra.adj || [];
        if (phraseEs.includes('{adj}') && eAdj.length) {
          for (const [adj, adjEn] of eAdj) {
            rows.push({
              id: `w_${String(idx).padStart(4, '0')}`,
              spanish: phraseEs.replaceAll('{obj}', obj).replaceAll('{adj}', adj),
              english: phraseEn.replaceAll('{objEn}', objEn).replaceAll('{adjEn}', adjEn),
              type: 'phrase',
            });
            idx += 1;
          }
        } else {
          rows.push({
            id: `w_${String(idx).padStart(4, '0')}`,
            spanish: phraseEs.replaceAll('{obj}', obj),
            english: phraseEn.replaceAll('{objEn}', objEn),
            type: 'phrase',
          });
          idx += 1;
        }
      }
    }
  }

  const unique = new Map();
  for (const row of rows) {
    const key = `${row.spanish.toLowerCase()}__${row.english.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, row);
  }

  const deduped = Array.from(unique.values());
  return deduped.map((row, i) => ({ ...row, id: `w_${String(i + 1).padStart(4, '0')}` }));
}

const records = {
  basics: createRows(basicsWords, [], [], {
    subjects: basicsPhraseSubjects,
    verbs: basicsPhraseVerbs,
    objects: basicsObjects,
  }),
  food: createRows(foodWords, [], [], {
    actions: foodActions,
    objects2: foodObjects,
  }),
  travel: createRows(travelWords, travelTemplates, travelObjects, {
    actions: travelActions,
    objects2: travelObjects,
  }),
  home: createRows(homeWords, [], [], {
    actions: homeTasks,
    objects2: homeObjects,
  }),
  work: createRows(workWords, [], [], {
    actions: workActions,
    objects2: workObjects,
  }),
  health: createRows(healthWords, [], [], {
    phrases: healthPhrases,
    objects3: healthObjects,
    adj: healthAdjectives,
    actions: healthActions,
    objects2: healthObjects,
  }),
};

for (const cat of categories) {
  const rows = records[cat.id];
  if (!rows || rows.length < 200) {
    throw new Error(`Category ${cat.id} does not meet 200 words requirement. Count=${rows?.length ?? 0}`);
  }

  const csvRows = [['id', 'spanish', 'english', 'type']];
  for (const row of rows) {
    csvRows.push([row.id, row.spanish, row.english, row.type]);
  }
  fs.writeFileSync(path.join(outDir, `${cat.id}.csv`), toCsv(csvRows));
  cat.total_words = rows.length;
}

const categoriesCsvRows = [['id', 'name', 'description', 'file', 'total_words']];
for (const cat of categories) {
  categoriesCsvRows.push([cat.id, cat.name, cat.description, `${cat.id}.csv`, cat.total_words]);
}
fs.writeFileSync(path.join(outDir, 'categories.csv'), toCsv(categoriesCsvRows));

console.log('Generated data files with counts:');
for (const cat of categories) {
  console.log(`${cat.id}: ${cat.total_words}`);
}

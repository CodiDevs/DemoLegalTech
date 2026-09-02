export interface GeoProvince {
  id: string;
  label: string;
  cities: string[];
}

export interface GeoCountry {
  id: string;
  label: string;
  provinces: GeoProvince[];
}

/** Países y divisiones para el paso de ubicación del cuestionario. */
export const GEO_COUNTRIES: GeoCountry[] = [
  {
    id: 'ec',
    label: 'Ecuador',
    provinces: [
      { id: 'azuay', label: 'Azuay', cities: ['Cuenca', 'Gualaceo', 'Paute', 'Santa Isabel'] },
      { id: 'bolivar', label: 'Bolívar', cities: ['Guaranda', 'San Miguel', 'Chillanes'] },
      { id: 'canar', label: 'Cañar', cities: ['Azogues', 'Cañar', 'La Troncal'] },
      { id: 'carchi', label: 'Carchi', cities: ['Tulcán', 'San Gabriel', 'El Ángel'] },
      { id: 'chimborazo', label: 'Chimborazo', cities: ['Riobamba', 'Guano', 'Alausí'] },
      { id: 'cotopaxi', label: 'Cotopaxi', cities: ['Latacunga', 'Salcedo', 'Pujilí'] },
      { id: 'el-oro', label: 'El Oro', cities: ['Machala', 'Pasaje', 'Santa Rosa', 'Huaquillas'] },
      { id: 'esmeraldas', label: 'Esmeraldas', cities: ['Esmeraldas', 'Atacames', 'Rosa Zárate'] },
      { id: 'galapagos', label: 'Galápagos', cities: ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'] },
      { id: 'guayas', label: 'Guayas', cities: ['Guayaquil', 'Durán', 'Milagro', 'Daule', 'Samborondón'] },
      { id: 'imbabura', label: 'Imbabura', cities: ['Ibarra', 'Otavalo', 'Atuntaqui'] },
      { id: 'loja', label: 'Loja', cities: ['Loja', 'Catamayo', 'Cariamanga'] },
      { id: 'los-rios', label: 'Los Ríos', cities: ['Babahoyo', 'Quevedo', 'Ventanas', 'Vinces'] },
      { id: 'manabi', label: 'Manabí', cities: ['Portoviejo', 'Manta', 'Chone', 'Jipijapa'] },
      { id: 'morona-santiago', label: 'Morona Santiago', cities: ['Macas', 'Sucúa', 'Gualaquiza'] },
      { id: 'napo', label: 'Napo', cities: ['Tena', 'Archidona', 'El Chaco'] },
      { id: 'orellana', label: 'Orellana', cities: ['Francisco de Orellana', 'La Joya de los Sachas'] },
      { id: 'pastaza', label: 'Pastaza', cities: ['Puyo', 'Mera', 'Santa Clara'] },
      { id: 'pichincha', label: 'Pichincha', cities: ['Quito', 'Cayambe', 'Sangolquí', 'Machachi', 'Rumiñahui'] },
      { id: 'santa-elena', label: 'Santa Elena', cities: ['Santa Elena', 'Salinas', 'La Libertad'] },
      { id: 'santo-domingo', label: 'Santo Domingo de los Tsáchilas', cities: ['Santo Domingo'] },
      { id: 'sucumbios', label: 'Sucumbíos', cities: ['Nueva Loja', 'Shushufindi', 'La Bonita'] },
      { id: 'tungurahua', label: 'Tungurahua', cities: ['Ambato', 'Pelileo', 'Baños de Agua Santa'] },
      { id: 'zamora-chinchipe', label: 'Zamora Chinchipe', cities: ['Zamora', 'Yantzaza', 'Zumbi'] },
    ],
  },
  {
    id: 'co',
    label: 'Colombia',
    provinces: [
      { id: 'bogota', label: 'Bogotá D.C.', cities: ['Bogotá'] },
      { id: 'antioquia', label: 'Antioquia', cities: ['Medellín', 'Envigado', 'Bello'] },
      { id: 'valle', label: 'Valle del Cauca', cities: ['Cali', 'Palmira', 'Buenaventura'] },
      { id: 'atlantico', label: 'Atlántico', cities: ['Barranquilla', 'Soledad'] },
    ],
  },
  {
    id: 'pe',
    label: 'Perú',
    provinces: [
      { id: 'lima', label: 'Lima', cities: ['Lima', 'Callao'] },
      { id: 'arequipa', label: 'Arequipa', cities: ['Arequipa', 'Camaná'] },
      { id: 'cusco', label: 'Cusco', cities: ['Cusco', 'Sicuani'] },
    ],
  },
  {
    id: 'us',
    label: 'Estados Unidos',
    provinces: [
      { id: 'fl', label: 'Florida', cities: ['Miami', 'Orlando', 'Tampa'] },
      { id: 'ny', label: 'Nueva York', cities: ['Nueva York', 'Buffalo'] },
      { id: 'tx', label: 'Texas', cities: ['Houston', 'Dallas', 'Austin'] },
      { id: 'ca', label: 'California', cities: ['Los Ángeles', 'San Francisco', 'San Diego'] },
    ],
  },
  {
    id: 'es',
    label: 'España',
    provinces: [
      { id: 'madrid', label: 'Madrid', cities: ['Madrid', 'Alcalá de Henares'] },
      { id: 'barcelona', label: 'Barcelona', cities: ['Barcelona', 'Badalona'] },
      { id: 'valencia', label: 'Valencia', cities: ['Valencia', 'Alicante'] },
    ],
  },
  {
    id: 'otro',
    label: 'Otro país',
    provinces: [
      { id: 'general', label: 'General', cities: ['Ciudad principal', 'Otra ciudad'] },
    ],
  },
];

export const DEFAULT_COUNTRY_ID = 'ec';
export const DEFAULT_PROVINCE_ID = 'pichincha';
export const DEFAULT_CITY = 'Quito';

export function findCountry(id: string): GeoCountry | undefined {
  return GEO_COUNTRIES.find((c) => c.id === id);
}

export function findProvince(countryId: string, provinceId: string): GeoProvince | undefined {
  const country = findCountry(countryId);
  return country?.provinces.find((p) => p.id === provinceId);
}

export function formatLocation(countryId: string, provinceId: string, city: string): string {
  const country = findCountry(countryId);
  const province = findProvince(countryId, provinceId);
  const parts = [city.trim()];
  if (province) parts.push(province.label);
  if (country) parts.push(country.label);
  return parts.filter(Boolean).join(', ');
}

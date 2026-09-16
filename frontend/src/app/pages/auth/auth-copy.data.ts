export type AuthMode = 'login' | 'register' | 'forgot' | 'forgot-sent';

export interface AuthAsideStep {
  title: string;
  body: string;
}

export const AUTH_NEXT_STEPS: AuthAsideStep[] = [
  {
    title: 'Responde unas preguntas',
    body: 'Comprobamos si tu caso se puede resolver en notaría.',
  },
  {
    title: 'Hablas con un abogado',
    body: 'Videollamada para revisar tu situación y resolver dudas.',
  },
  {
    title: 'Firmas sin salir de casa',
    body: 'Subes tus documentos y firmas en línea. Nosotros gestionamos la notaría.',
  },
];

export const AUTH_COPY = {
  brand: 'LegalStation',
  loginTitle: 'Inicia sesión',
  loginLead: '',
  checkoutLoginLead: 'Entra para pagar el trámite y abrir el expediente.',
  registerTitle: 'Crea tu cuenta',
  registerLead: 'Con una sola cuenta gestionas cualquier trámite de LegalStation.',
  checkoutRegisterLead: 'Crea tu cuenta para pagar el trámite.',
  forgotTitle: 'Recupera el acceso',
  forgotLead: 'Introduce tu correo y te indicaremos cómo restablecer tu contraseña.',
  forgotSentTitle: 'Revisa tu correo',
  forgotSentLead:
    'Si existe una cuenta con ese correo, recibirás instrucciones. En este entorno de ejemplo no se envía correo. Escribe a soporte@legalstation.ec si necesitas ayuda.',
  enter: 'Ingresar',
  entering: 'Iniciando sesión…',
  create: 'Crear cuenta',
  creating: 'Creando tu cuenta…',
  sendLink: 'Enviar enlace',
  sending: 'Enviando…',
  backToLogin: 'Volver a iniciar sesión',
  forgotLink: '¿Olvidaste tu contraseña?',
  switchToRegister: '¿Es tu primera vez?',
  switchToRegisterCta: 'Crear una cuenta',
  switchToLogin: '¿Ya tienes cuenta?',
  switchToLoginCta: 'Ingresar',
  demoTitle: 'Cuentas de ejemplo',
  demoHint: 'Elige una cuenta y el formulario se completa solo.',
  asideEyebrow: 'Qué sigue después',
  asideFoot: 'Tus documentos solo los ve el abogado asignado a tu caso.',
  lockNote: 'Conexión segura · LegalStation',
} as const;

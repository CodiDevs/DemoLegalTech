export type AuthMode = 'login' | 'register' | 'forgot' | 'forgot-sent';

export interface AuthAsideStep {
  icon: 'clipboard' | 'users' | 'signature' | 'lock' | 'mail';
  title: string;
  body: string;
}

export const AUTH_NEXT_STEPS: AuthAsideStep[] = [
  {
    icon: 'clipboard',
    title: 'Responde unas preguntas',
    body: 'Comprobamos en minutos si tu caso se puede resolver en notaría.',
  },
  {
    icon: 'users',
    title: 'Hablas con un abogado',
    body: 'Videollamada para revisar tu situación y resolver dudas.',
  },
  {
    icon: 'signature',
    title: 'Firmas sin salir de casa',
    body: 'Subes tus documentos y firmas en línea. Nosotros gestionamos la notaría.',
  },
];

export const AUTH_COPY = {
  brand: 'LegalStation',
  loginTitle: 'Bienvenido de nuevo',
  loginLead: 'Accede a tu cuenta para continuar tu trámite.',
  registerTitle: 'Crea tu cuenta',
  registerLead: 'Con una sola cuenta gestionas cualquier trámite de LegalStation.',
  forgotTitle: 'Recupera el acceso',
  forgotLead: 'Introduce tu correo y te indicaremos cómo restablecer tu contraseña.',
  forgotSentTitle: 'Revisa tu correo',
  forgotSentLead:
    'Si existe una cuenta con ese correo, recibirás instrucciones. En esta demo no enviamos correo real: contacta a soporte@legalstation.ec si necesitas ayuda.',
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
  demoTitle: 'Acceso rápido (demo)',
  demoHint: 'Rellenan el formulario para que solo pulses Ingresar.',
  asideEyebrow: 'Qué sigue después',
  asideFoot: 'Tus documentos solo los ve el abogado asignado a tu caso.',
  lockNote: 'Conexión segura · LegalStation',
} as const;

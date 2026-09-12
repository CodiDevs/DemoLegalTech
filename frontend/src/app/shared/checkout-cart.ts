import { QuestionnaireAnswers } from '../core/api.service';

export interface CheckoutCartLine {
  id: string;
  label: string;
  /** Precio de referencia en centavos (demo). */
  referenceCents: number;
  /** Si el ítem aplica al caso según el cuestionario. */
  applies: boolean;
  /** Si está cubierto por el paquete (muestra «Incluido»). */
  includedInPackage: boolean;
  /** Gasto que no se cobra aquí (notaría, tasas). */
  billedSeparately?: boolean;
}

export interface CheckoutCart {
  lines: CheckoutCartLine[];
  packageCents: number;
  extrasReferenceCents: number;
  discountCents: number;
  totalCents: number;
}

/** Gastos notariales de referencia en divorcio notarial Ecuador (demo). */
export const NOTARY_FEE_CENTS = 2000;

interface ExtraRule {
  id: string;
  label: string;
  referenceCents: number;
  applies: (q: Partial<QuestionnaireAnswers>) => boolean;
}

const EXTRA_RULES: ExtraRule[] = [
  {
    id: 'children',
    label: 'Hijos en común',
    referenceCents: 7500,
    applies: (q) => Boolean(q.have_children),
  },
  {
    id: 'mediation',
    label: 'Sin acta de mediación',
    referenceCents: 5000,
    applies: (q) => Boolean(q.have_children && q.minor_dependents && !q.has_mediation_acta),
  },
  {
    id: 'liquidation',
    label: 'Liquidación de bienes',
    referenceCents: 12000,
    applies: (q) => Boolean(q.have_assets && q.want_liquidate_assets),
  },
  {
    id: 'conjugal',
    label: 'Sociedad conyugal',
    referenceCents: 6000,
    applies: (q) => Boolean(q.have_assets && q.conjugal_society),
  },
  {
    id: 'abroad',
    label: 'Persona en el exterior',
    referenceCents: 4500,
    applies: (q) => Boolean(q.someone_abroad),
  },
  {
    id: 'assets-deferred',
    label: 'Bienes sin liquidar ahora',
    referenceCents: 3500,
    applies: (q) => Boolean(q.have_assets && !q.want_liquidate_assets),
  },
];

export function buildCheckoutCart(
  totalCents: number,
  questionnaire: Partial<QuestionnaireAnswers> = {},
): CheckoutCart {
  const baseLines: CheckoutCartLine[] = [
    {
      id: 'procedure',
      label: 'Valor del trámite',
      referenceCents: totalCents,
      applies: true,
      includedInPackage: false,
    },
    {
      id: 'notary',
      label: 'Gastos notariales',
      referenceCents: NOTARY_FEE_CENTS,
      applies: true,
      includedInPackage: false,
      billedSeparately: true,
    },
  ];

  const extraLines: CheckoutCartLine[] = EXTRA_RULES
    .filter((rule) => rule.applies(questionnaire))
    .map((rule) => ({
      id: rule.id,
      label: rule.label,
      referenceCents: rule.referenceCents,
      applies: true,
      includedInPackage: true,
    }));

  const extrasReferenceCents = extraLines.reduce((sum, line) => sum + line.referenceCents, 0);
  const discountCents = extrasReferenceCents;

  return {
    lines: [...baseLines, ...extraLines],
    packageCents: totalCents,
    extrasReferenceCents,
    discountCents,
    totalCents: totalCents,
  };
}

/** Suma de líneas cobradas aquí (excluye incluidos y billedSeparately). */
export function chargedLineCents(cart: CheckoutCart): number {
  return cart.lines
    .filter((line) => line.applies && !line.includedInPackage && !line.billedSeparately)
    .reduce((sum, line) => sum + line.referenceCents, 0);
}

export function parseQuestionnaire(raw?: string | Record<string, unknown>): Partial<QuestionnaireAnswers> {
  if (!raw) return {};
  if (typeof raw === 'object') return raw as Partial<QuestionnaireAnswers>;
  try {
    return JSON.parse(raw) as Partial<QuestionnaireAnswers>;
  } catch {
    return {};
  }
}

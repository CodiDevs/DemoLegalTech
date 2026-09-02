package questionnaire

import (
	"encoding/json"
	"net/http"
)

type Answers struct {
	BothWantDivorce      bool   `json:"both_want_divorce"`
	MarriageInEcuador    bool   `json:"marriage_in_ecuador"`
	HaveChildren         bool   `json:"have_children"`
	MinorDependents      bool   `json:"minor_dependents"`
	CustodyRegulated     bool   `json:"custody_regulated"`
	HasMediationActa     bool   `json:"has_mediation_acta"`
	SomeoneAbroad        bool   `json:"someone_abroad"`
	HaveAssets           bool   `json:"have_assets"`
	ConjugalSociety      bool   `json:"conjugal_society"`
	IDsValid             bool   `json:"ids_valid"`
	WantLiquidateAssets  bool   `json:"want_liquidate_assets"`
	Country              string `json:"country"`
	Province             string `json:"province"`
	City                 string `json:"city"`
}

type Result struct {
	Code     string `json:"code"` // apto | evaluacion | no_aplica
	Title    string `json:"title"`
	Message  string `json:"message"`
	CTA      string `json:"cta"`
	PriceUSD int    `json:"price_usd"`
	Product  string `json:"product"`
}

func Evaluate(a Answers) Result {
	if !a.BothWantDivorce || !a.MarriageInEcuador {
		return Result{
			Code: "no_aplica", Title: "No corresponde al procedimiento simplificado",
			Message: "El caso no es apto para la vía notarial simplificada. Te derivamos al área jurídica tradicional del bufete.",
			CTA: "Contactar área jurídica", PriceUSD: 0, Product: "gestión manual",
		}
	}
	if !a.IDsValid {
		return Result{
			Code: "evaluacion", Title: "Necesita resolver algo primero",
			Message: "Ambas partes deben contar con documentos de identificación vigentes antes de continuar.",
			CTA: "Agendar evaluación", PriceUSD: 749, Product: "evaluación / acompañamiento previo",
		}
	}
	if a.HaveChildren && a.MinorDependents && !(a.CustodyRegulated || a.HasMediationActa) {
		return Result{
			Code: "evaluacion", Title: "Necesita resolver algo primero",
			Message: "Existen hijos menores sin regulación previa de alimentos, tenencia o visitas. Se requiere evaluación previa.",
			CTA: "Agendar evaluación", PriceUSD: 749, Product: "evaluación / acompañamiento previo",
		}
	}
	return Result{
		Code: "apto", Title: "Apto para Divorcio360",
		Message: "Tu caso preliminarmente puede tramitarse mediante divorcio notarial por mutuo consentimiento.",
		CTA: "Iniciar mi divorcio", PriceUSD: 349, Product: "flujo completo de autoservicio",
	}
}

func Handle(w http.ResponseWriter, r *http.Request) {
	var a Answers
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, `{"error":"JSON inválido"}`, http.StatusBadRequest)
		return
	}
	res := Evaluate(a)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

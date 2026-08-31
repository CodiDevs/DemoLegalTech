package products

import (
	"encoding/json"
	"strings"
)

// DocReq defines the two required upload/review document types per product.
type DocReq struct {
	Type1, Type2   string
	Label1, Label2 string
}

// RequiredDoc is a single required document for API responses.
type RequiredDoc struct {
	Type  string `json:"type"`
	Label string `json:"label"`
}

func Normalize(product string) string {
	p := strings.TrimSpace(product)
	if p == "" {
		return "divorcio360"
	}
	return p
}

func DocRequirement(product string) DocReq {
	switch Normalize(product) {
	case "traslado360":
		return DocReq{"matricula", "acuerdo", "Matrícula vehicular", "Acuerdo de traslado"}
	case "bienraiz360":
		return DocReq{"titulo", "acuerdo", "Título del inmueble", "Acuerdo mutuo"}
	default:
		return DocReq{"cedula", "partida", "Cédula del cliente", "Partida de matrimonio"}
	}
}

func RequiredDocs(product string) []RequiredDoc {
	req := DocRequirement(product)
	return []RequiredDoc{
		{Type: req.Type1, Label: req.Label1},
		{Type: req.Type2, Label: req.Label2},
	}
}

func ValidDocTypes(product string) []string {
	switch Normalize(product) {
	case "traslado360":
		return []string{"matricula", "acuerdo", "titulo", "cedula", "partida"}
	case "bienraiz360":
		return []string{"titulo", "acuerdo", "cedula", "partida", "matricula"}
	default:
		return []string{"cedula", "partida"}
	}
}

func RequiredPair(product string) (type1, type2 string) {
	req := DocRequirement(product)
	return req.Type1, req.Type2
}

func UploadStatusMessage(product string) string {
	req := DocRequirement(product)
	return "En espera de carga de " + strings.ToLower(req.Label1) + " y " + strings.ToLower(req.Label2)
}

func ApproveActionDescription(product string) string {
	req := DocRequirement(product)
	return "Aprueba " + strings.ToLower(req.Label1) + " y " + strings.ToLower(req.Label2) +
		" en la pestaña Documentos; luego pasa a estado 04 para generar la minuta"
}

func StageHint(status, product string) string {
	_ = product
	switch status {
	case "01", "02":
		return "El cliente debe subir los documentos del trámite"
	case "03":
		return "Revisa y aprueba los documentos del cliente"
	case "04":
		return "Genera la minuta y notifica al cliente para firma virtual"
	case "05":
		return "Espera la firma del cliente y confírmala en la pestaña Firmas"
	default:
		return ""
	}
}

func ProductFromQuestionnaire(q map[string]any) string {
	if q == nil {
		return ""
	}
	v, ok := q["product"]
	if !ok {
		return ""
	}
	s, ok := v.(string)
	if !ok {
		return ""
	}
	return strings.TrimSpace(s)
}

func ResolveProduct(bodyProduct string, questionnaireJSON string) string {
	if p := strings.TrimSpace(bodyProduct); p != "" {
		return Normalize(p)
	}
	var q map[string]any
	if questionnaireJSON != "" && questionnaireJSON != "{}" {
		_ = json.Unmarshal([]byte(questionnaireJSON), &q)
		if p := ProductFromQuestionnaire(q); p != "" {
			return Normalize(p)
		}
	}
	return "divorcio360"
}

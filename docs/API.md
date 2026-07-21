# Documentación de la API

Base URL local: `http://127.0.0.1:5000`. Todas las rutas excepto registro e inicio de sesión requieren el encabezado `x-access-token: <JWT>`.

Los importes se reciben como números o textos numéricos y se devuelven como texto para no perder precisión decimal. Los gastos y pagos de deuda se almacenan como valores negativos; la API normaliza el signo al crear una transacción.

## Autenticación

| Método | Ruta | Cuerpo | Respuesta correcta |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ "username", "password" }` | `201` y mensaje de creación |
| POST | `/api/auth/login` | `{ "username", "password" }` | `200`, `{ "message", "token" }` |

El JWT expira en 24 horas. Los errores de autenticación devuelven `401` con un campo `error`.

## Transacciones

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/transactions/new` | Crea un ingreso, gasto, pago de deuda o compra a MSI. |
| GET | `/api/transactions?limit=20` | Lista las transacciones más recientes. |
| POST | `/api/transactions/set_initial` | Añade un saldo inicial a la cuenta de efectivo. |
| GET | `/api/transactions/balance` | Devuelve el saldo de efectivo y débito. |

Ejemplo para crear una transacción:

```json
{
  "description": "Supermercado",
  "amount": "850.50",
  "type": "expense",
  "category": "Alimentos",
  "account_id": 2,
  "installments": 1,
  "date": "2026-07-21T12:00:00"
}
```

`account_id`, `category`, `debt_id`, `installments` y `date` son opcionales. Si se omite la cuenta, se crea o usa la cuenta `Efectivo`. Tipos válidos: `expense`, `income`, `initial_balance`, `debt_payment`.

Una transacción listada contiene `id`, `description`, `amount`, `date`, `category`, `account_id`, `account_name`, `type`, `installments` y `debt_id`.

## Cuentas

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/accounts/new` | Crea una cuenta. |
| GET | `/api/accounts/summary` | Lista cuentas y saldo actual. |
| GET | `/api/accounts/{account_id}/transactions` | Lista movimientos de una cuenta propia. |

```json
{
  "name": "Tarjeta principal",
  "type": "credit_card",
  "closing_date": 5,
  "payment_date": 24
}
```

Tipos de cuenta: `credit_card`, `debit_card`, `cash`. Las fechas de corte y pago solo aplican a tarjetas de crédito.

## Reglas recurrentes

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/rules/new` | Crea un gasto o ingreso recurrente. |
| GET | `/api/rules/` | Lista reglas del usuario. |
| DELETE | `/api/rules/{rule_id}` | Elimina una regla propia. |

```json
{
  "description": "Internet",
  "amount": "599",
  "type": "expense",
  "frequency": "monthly",
  "first_execution_date": "2026-08-01"
}
```

Frecuencias: `daily`, `weekly`, `bi_weekly`, `monthly`, `yearly`, `once`. En gastos el importe se normaliza como negativo.

## Deudas

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/debts/new` | Crea la deuda y una regla de pago asociada. |
| GET | `/api/debts/` | Lista deudas con importes pagados y pendientes. |

```json
{
  "debt_name": "Préstamo personal",
  "original_amount": "12000",
  "monthly_payment_amount": "1000",
  "term_months": 12,
  "frequency": "monthly",
  "first_payment_date": "2026-08-15"
}
```

Para registrar un abono, cree una transacción `debt_payment` con `debt_id`. El campo `remaining_amount` se calcula desde esos pagos.

## Resúmenes y proyección

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/api/summary/categories` | Gastos agrupados por categoría: `{ category, total }[]`. |
| GET | `/api/summary/monthly_payments` | Pagos fijos y de tarjetas del mes: `{ date, description, amount }[]`. |
| GET | `/api/projection?months_ahead=3` | Flujo proyectado de efectivo. |

La proyección devuelve `start_balance`, `projected_balance_end`, intervalo de fechas y `simulation_log`. Requiere al menos una cuenta de tipo `cash` o `debit_card`.

## Errores

Los errores usan el formato `{ "error": "descripción" }`. Los códigos más habituales son `400` (datos inválidos), `401` (JWT ausente, inválido o vencido), `404` (recurso no disponible) y `409` (usuario repetido).

# Schema Database Anatema (estratto reale)

## Tabella: users
| column_name   | data_type                  | is_nullable | column_default           |
|-------------- |---------------------------|-------------|-------------------------|
| id            | uuid                      | NO          | gen_random_uuid()       |
| created_at    | timestamp                 | YES         | now()                   |
| username      | character varying         | NO          |                         |
| password_hash | character varying         | NO          |                         |
| email         | character varying         | NO          |                         |
| role          | character varying         | NO          | 'user'::character varying|

## Tabella: projects
| column_name | data_type                  | is_nullable | column_default     |
|-------------|---------------------------|-------------|-------------------|
| id          | uuid                      | NO          | gen_random_uuid() |
| owner_id    | uuid                      | YES         |                   |
| created_at  | timestamp                 | YES         | now()             |
| updated_at  | timestamp                 | YES         | now()             |
| name        | character varying         | NO          |                   |

## Tabella: excel_rows
| column_name | data_type | is_nullable | column_default     |
|-------------|-----------|-------------|-------------------|
| id          | uuid      | NO          | gen_random_uuid() |
| sheet_id    | uuid      | YES         |                   |
| row_index   | integer   | YES         |                   |

## Tabella: excel_columns
| column_name  | data_type         | is_nullable | column_default     |
|--------------|------------------|-------------|-------------------|
| id           | uuid             | NO          | gen_random_uuid() |
| sheet_id     | uuid             | YES         |                   |
| column_index | integer          | YES         |                   |
| name         | character varying| NO          |                   |

## Tabella: excel_sheets
| column_name | data_type         | is_nullable | column_default     |
|-------------|------------------|-------------|-------------------|
| id          | uuid             | NO          | gen_random_uuid() |
| file_id     | uuid             | YES         |                   |
| sheet_index | integer          | YES         |                   |
| name        | character varying| NO          |                   |

## Tabella: files
| column_name   | data_type                  | is_nullable | column_default     |
|---------------|---------------------------|-------------|-------------------|
| id            | uuid                      | NO          | gen_random_uuid() |
| uploaded_at   | timestamp                 | YES         | now()             |
| uploader_id   | uuid                      | YES         |                   |
| file_size     | integer                   | YES         |                   |
| project_id    | uuid                      | YES         |                   |
| filename      | character varying         | NO          |                   |
| file_type     | character varying         | YES         |                   |
| original_name | character varying         | YES         |                   |

## Tabella: labels
(vedi output precedente, integer PK, name, description, color, categories[], created_at)

---

Questo file riflette la struttura reale delle tabelle principali del database PostgreSQL attualmente in uso.

import psycopg2
import psycopg2.extras
import csv
import json
from datetime import datetime
import os

# Tu URL de conexión
DATABASE_URL = "postgresql://postgres:VaLqxGBzdzZmBTddchzzryKgNeQmoPfI@switchback.proxy.rlwy.net:14573/railway?sslmode=require"

def download_all_tables():
    """Descarga todas las tablas a archivos CSV"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Obtener lista de tablas
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cur.fetchall()
        
        print(f"📊 Encontradas {len(tables)} tablas")
        
        for table in tables:
            table_name = table[0]
            print(f"\n📥 Descargando tabla: {table_name}")
            
            # Obtener datos de la tabla
            cur.execute(f"SELECT * FROM {table_name} ORDER BY id;")
            rows = cur.fetchall()
            
            # Obtener nombres de columnas
            col_names = [desc[0] for desc in cur.description]
            
            # Guardar como CSV
            filename = f"{table_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            with open(filename, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(col_names)
                writer.writerows(rows)
            
            print(f"   ✅ {len(rows)} registros guardados en {filename}")
            
            # También guardar muestra en JSON
            if rows:
                sample = []
                for row in rows[:5]:  # Solo 5 registros de muestra
                    sample.append(dict(zip(col_names, row)))
                
                json_filename = f"{table_name}_sample.json"
                with open(json_filename, 'w', encoding='utf-8') as f:
                    json.dump(sample, f, indent=2, default=str)
                print(f"   📝 Muestra guardada en {json_filename}")
        
        cur.close()
        conn.close()
        print("\n✅ Descarga completada!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def download_as_sql():
    """Descarga como script SQL con INSERTs"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Obtener lista de tablas
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cur.fetchall()
        
        sql_filename = f"backup_completo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        
        with open(sql_filename, 'w', encoding='utf-8') as f:
            f.write("-- Backup generado automáticamente\n")
            f.write(f"-- Fecha: {datetime.now()}\n\n")
            
            for table in tables:
                table_name = table[0]
                print(f"📥 Procesando tabla: {table_name}")
                
                # Obtener estructura de la tabla
                cur.execute(f"""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = '{table_name}'
                    ORDER BY ordinal_position;
                """)
                columns = cur.fetchall()
                col_names = [col[0] for col in columns]
                
                # Obtener datos
                cur.execute(f"SELECT * FROM {table_name} ORDER BY id;")
                rows = cur.fetchall()
                
                # Escribir CREATE TABLE (simplificado)
                f.write(f"\n-- Tabla: {table_name}\n")
                f.write(f"DELETE FROM {table_name};\n")
                
                # Escribir INSERTs
                for row in rows:
                    values = []
                    for val in row:
                        if val is None:
                            values.append("NULL")
                        elif isinstance(val, (int, float)):
                            values.append(str(val))
                        elif isinstance(val, bool):
                            values.append("TRUE" if val else "FALSE")
                        else:
                            # Escapar comillas simples
                            escaped = str(val).replace("'", "''")
                            values.append(f"'{escaped}'")
                    
                    insert = f"INSERT INTO {table_name} ({', '.join(col_names)}) VALUES ({', '.join(values)});\n"
                    f.write(insert)
                
                print(f"   ✅ {len(rows)} registros exportados")
        
        print(f"\n✅ Backup SQL guardado en: {sql_filename}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def check_database_size():
    """Verifica el tamaño de la base de datos"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Tamaño total
        cur.execute("""
            SELECT 
                pg_database_size(current_database()) as total_bytes,
                pg_size_pretty(pg_database_size(current_database())) as total_pretty;
        """)
        total_bytes, total_pretty = cur.fetchone()
        print(f"\n💾 Tamaño total de la BD: {total_pretty} ({total_bytes} bytes)")
        
        # Tamaño por tabla
        cur.execute("""
            SELECT
                table_name,
                pg_total_relation_size(quote_ident(table_name)) as total_bytes,
                pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as total_pretty,
                (SELECT count(*) FROM quote_ident(table_name)) as row_count
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY total_bytes DESC;
        """)
        
        tables = cur.fetchall()
        print("\n📊 Tamaño por tabla:")
        for table in tables:
            print(f"   {table[0]}: {table[2]} ({table[3]} filas)")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

def export_to_json():
    """Exporta todas las tablas a formato JSON"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Obtener lista de tablas
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cur.fetchall()
        
        all_data = {}
        
        for table in tables:
            table_name = table['table_name']
            print(f"📥 Exportando tabla: {table_name}")
            
            # Obtener datos
            cur.execute(f"SELECT * FROM {table_name} ORDER BY id;")
            rows = cur.fetchall()
            
            # Convertir datetime a string
            for row in rows:
                for key, value in row.items():
                    if isinstance(value, datetime):
                        row[key] = value.isoformat()
            
            all_data[table_name] = rows
        
        # Guardar como JSON
        json_filename = f"backup_json_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=2, default=str)
        
        print(f"\n✅ JSON guardado en: {json_filename}")
        
        # Resumen
        for table, rows in all_data.items():
            print(f"   {table}: {len(rows)} registros")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔍 Verificando conexión a la base de datos...")
    
    # Verificar tamaño primero
    check_database_size()
    
    print("\n" + "="*50)
    print("OPCIONES DE DESCARGA:")
    print("1. Descargar como CSV (archivos separados)")
    print("2. Descargar como SQL (con INSERTs)")
    print("3. Descargar como JSON (estructura completa)")
    print("4. Descargar TODO")
    print("="*50)
    
    opcion = input("\nSelecciona una opción (1-4): ").strip()
    
    if opcion == "1":
        download_all_tables()
    elif opcion == "2":
        download_as_sql()
    elif opcion == "3":
        export_to_json()
    elif opcion == "4":
        print("\n📦 Descargando todo...")
        download_all_tables()
        download_as_sql()
        export_to_json()
    else:
        print("❌ Opción no válida")
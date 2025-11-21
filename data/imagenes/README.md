# Carpeta de Imágenes de Personas

Esta carpeta almacena todas las imágenes asociadas a las personas del sistema PICUVIMO.

## Estructura

Las imágenes se guardan con el siguiente formato de nombre:
```
persona_{id}_{nombre_imagen}_{uuid}.{ext}
```

Por ejemplo:
- `persona_36_retrato_a1b2c3d4.jpg`
- `persona_12_cuadro_5e6f7g8h.png`

## Sincronización con Google Drive

Esta carpeta y su contenido se sincroniza automáticamente con Google Drive cuando la funcionalidad está habilitada.

## Formatos Soportados

- JPEG/JPG
- PNG
- GIF
- WEBP

## Gestión

Las imágenes se gestionan automáticamente a través de la API:
- `POST /personas/{id}/imagenes/` - Subir nueva imagen
- `GET /personas/{id}/imagenes/` - Listar imágenes de una persona
- `GET /imagenes/{id}` - Obtener archivo de imagen
- `DELETE /imagenes/{id}` - Eliminar imagen (borra archivo y registro)

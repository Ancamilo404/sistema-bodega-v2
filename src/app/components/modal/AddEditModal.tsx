'use client';
import React, { useState, useRef, useEffect } from 'react';
import ModalBase from './ModalBase';
import { formSchemas } from './formSchemas';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface AddEditModalProps {
  entity: keyof typeof formSchemas;
  initialData?: any;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function AddEditModal({
  entity,
  initialData,
  onClose,
  onSuccess,
}: AddEditModalProps) {
  const schema = formSchemas[entity];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario
  const [formData, setFormData] = useState(
    schema.reduce(
      (acc, field) => {
        // ⚡ Password siempre inicia vacío en edición
        if (field.name === 'password') {
          acc[field.name] = '';
        } else if (initialData?.[field.name] !== undefined && initialData?.[field.name] !== null) {
          // ⚡ Si es numérico, convertir a string para que el input number lo muestre
          acc[field.name] =
            field.type === 'number'
              ? String(initialData[field.name])
              : String(initialData[field.name]);
        } else {
          acc[field.name] = '';
        }
        return acc;
      },
      {} as Record<string, any>
    )
  );

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imagen || '');

  // Estado para opciones async
  const [asyncOptions, setAsyncOptions] = useState<Record<string, any[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>({});

  // Cargar opciones async al montar
  useEffect(() => {
    schema.forEach(async field => {
      if (field.type === 'select-async' && field.endpoint) {
        setLoadingOptions(prev => ({ ...prev, [field.name]: true }));
        try {
          const res = await fetch(field.endpoint);
          const json = await res.json();
          // ✅ Asegurar que siempre sea un array
          let options = [];
          if (Array.isArray(json.data?.items)) {
            options = json.data.items;
          } else if (Array.isArray(json.data)) {
            options = json.data;
          }
          setAsyncOptions(prev => ({
            ...prev,
            [field.name]: options,
          }));
        } catch (error) {
          console.error(`Error cargando opciones para ${field.name}:`, error);
          toast.error(`Error al cargar ${field.label}`);
          // ✅ Inicializar como array vacío si hay error
          setAsyncOptions(prev => ({
            ...prev,
            [field.name]: [],
          }));
        } finally {
          setLoadingOptions(prev => ({ ...prev, [field.name]: false }));
        }
      }
    });
  }, [schema]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'imagen' && value.startsWith('http')) {
      setImagePreview(value);
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData({ ...formData, imagen: base64 });
      setImagePreview(base64);
      toast.success('Imagen cargada correctamente');
    };
    reader.onerror = () => {
      toast.error('Error al cargar la imagen');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, boolean> = {};
    schema.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // ⚡ Preparar payload
    const payload = { ...formData };

    // Si password está vacío en edición, no lo mandamos
    if (!payload.password?.trim()) {
      delete payload.password;
    }

    // Convertir valores numéricos
    if (payload.precio !== undefined && payload.precio !== '') {
      payload.precio = Number(payload.precio);
    }
    if (payload.stock !== undefined && payload.stock !== '') {
      payload.stock = Number(payload.stock);
    }
    if (payload.impuesto !== undefined && payload.impuesto !== '') {
      payload.impuesto = Number(payload.impuesto);
    }
    if (payload.descuento !== undefined && payload.descuento !== '') {
      payload.descuento = Number(payload.descuento);
    }
    if (payload.clienteId !== undefined && payload.clienteId !== '') {
      payload.clienteId = Number(payload.clienteId);
    }

    // ⚡ Ajuste para aliadoId
    if (payload.aliadoId === '' || payload.aliadoId === null) {
      payload.aliadoId = null; // en update debe ir null
    } else {
      payload.aliadoId = Number(payload.aliadoId);
    }

    const url = initialData ? `/api/${entity}s/${initialData.id}` : `/api/${entity}s`;
    const method = initialData ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok) {
        toast.success(json.message || `${entity} guardado correctamente`);
        onSuccess(json.data);
      } else {
        toast.error(json.error || 'Error en operación');
      }
    } catch (error) {
      console.error('Error en submit:', error);
      toast.error('Error de conexión');
    }
  };

  return (
    <ModalBase title={initialData ? `Editar ${entity}` : `Registrar ${entity}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        {schema.map(field => (
          <div key={field.name}>
            <label>{field.label}</label>

            {field.name === 'password' ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className={errors[field.name] ? 'input-error' : ''}
                  placeholder={initialData ? 'Deja vacío para mantener la contraseña' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="btn-toggle-password"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            ) : field.type === 'select' ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                className={errors[field.name] ? 'input-error' : ''}
              >
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === 'select-async' ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                className={errors[field.name] ? 'input-error' : ''}
                disabled={loadingOptions[field.name]}
              >
                <option value="">Ninguno</option>
                {(asyncOptions[field.name] || []).map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre} {item.documento ? `(${item.documento})` : ''}
                  </option>
                ))}
              </select>
            ) : field.type === 'image' ? (
              <div className="image-input-container">
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder="Pega una URL o sube un archivo"
                  className={errors[field.name] ? 'input-error' : ''}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-upload-image"
                  >
                    📁 Subir archivo
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, imagen: '' });
                        setImagePreview('');
                      }}
                      className="btn-clear-image"
                    >
                      🗑️ Limpiar
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        marginTop: '12px',
                      }}
                    />
                  </div>
                )}
                {field.help && (
                  <small style={{ color: '#666', fontSize: '12px' }}>{field.help}</small>
                )}
              </div>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                step={field.step}
                className={errors[field.name] ? 'input-error' : ''}
              />
            )}
          </div>
        ))}

        <button type="submit" className="btn-submit-modal">
          {initialData ? 'Guardar cambios' : 'Registrar'}
        </button>
      </form>
    </ModalBase>
  );
}

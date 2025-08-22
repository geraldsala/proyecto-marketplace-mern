import React, { useEffect, useState } from "react";
// ⬇️ Servicio REAL que pegaste (default export). Si tu ruta es distinta, cambia SOLO esta línea.
import userService from "../services/userService";

/**
 * Helper a prueba de balas: siempre devuelve un array
 */
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

/**
 * Panel completo y funcional para direcciones de envío.
 * - Blindado contra `addresses.map is not a function`.
 * - Soporta respuestas del backend como: objeto, array o { addresses: [...] }.
 */
export default function ShippingAddressesPanel(props) {
  const [addressesState, setAddressesState] = useState([]); // ¡nunca null!
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Estado del formulario (ajusta campos a tu modelo real si difieren)
  const [form, setForm] = useState({
    name: "",
    addressLine: "",
    city: "",
    province: "",
    zip: "",
    phone: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Cargar perfil y normalizar direcciones al montar
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const profile = await userService.getProfile();
        // Intenta varias llaves comunes
        const list = profile?.addresses ?? profile?.shippingAddresses ?? profile?.data?.addresses ?? [];
        if (alive) setAddressesState(asArray(list));
      } catch (e) {
        console.error(e);
        if (alive) {
          setError("No se pudo cargar el perfil");
          setAddressesState([]);
        }
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Agregar dirección (POST)
  const onAdd = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const res = await userService.addShippingAddress(form);

      // 🔒 Guardamos SIEMPRE un array plano en estado
      setAddressesState((prev) => {
        if (Array.isArray(res?.addresses)) return asArray(res.addresses);
        return [...asArray(prev), ...asArray(res)];
      });

      // Limpia el form
      setForm({ name: "", addressLine: "", city: "", province: "", zip: "", phone: "" });
    } catch (e) {
      console.error(e);
      setError(e?.message || "No se pudo guardar la dirección");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar dirección
  const onDelete = async (id) => {
    try {
      setError("");
      const res = await userService.deleteShippingAddress(id);
      setAddressesState((prev) => {
        if (Array.isArray(res?.addresses)) return asArray(res.addresses); // server ya manda lista actualizada
        return asArray(prev).filter((a) => String(a?._id ?? a?.id) !== String(id));
      });
    } catch (e) {
      console.error(e);
      setError(e?.message || "No se pudo eliminar");
    }
  };

  // ==================
  // 🔍 Normalización ULTRA defensiva antes del render
  //    - Si llega `props.addresses`, lo usamos.
  //    - Si accidentalmente quedó {addresses: [...]} en estado, lo tomamos.
  //    - Si quedó objeto suelto, lo envolvemos en array.
  // ==================
  const raw = props?.addresses ?? addressesState;
  const list = asArray(raw?.addresses ?? raw);

  // Debug express para ver formas reales en runtime
  console.log("addresses raw (props||state):", raw);
  console.log("list used to render:", list);

  return () => {
      alive = false;
    };
  }, []);

  // Agregar dirección (POST)
  const onAdd = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const res = await userService.addShippingAddress(form);

      // 🔒 Guardamos SIEMPRE un array plano en estado
      setAddresses((prev) => {
        if (Array.isArray(res?.addresses)) return asArray(res.addresses);
        return asArray(res);
      });

      // Limpia el form
      setForm({ name: "", addressLine: "", city: "", province: "", zip: "", phone: "" });
    } catch (e) {
      console.error(e);
      setError(e?.message || "No se pudo guardar la dirección");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar dirección
  const onDelete = async (id) => {
    try {
      setError("");
      const res = await userService.deleteShippingAddress(id);
      setAddresses((prev) => {
        if (Array.isArray(res?.addresses)) return asArray(res.addresses); // server ya manda lista actualizada
        return asArray(prev).filter((a) => String(a?._id ?? a?.id) !== String(id));
      });
    } catch (e) {
      console.error(e);
      setError(e?.message || "No se pudo eliminar");
    }
  };

  // ==================
  // 🔍 Normalización ULTRA defensiva antes del render
  //    - Si accidentalmente quedó {addresses: [...]} en estado, lo tomamos.
  //    - Si quedó objeto suelto, lo envolvemos en array.
  // ==================
  const list = asArray(addresses?.addresses ?? addresses);

  // Debug express para ver formas reales en runtime
  console.log("addresses (raw):", addresses);
  console.log("list used to render:", list);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Direcciones de envío</h2>

      {error && (
        <div className="mb-3 p-3 rounded bg-red-100 text-red-800 text-sm">{error}</div>
      )}

      {/* Formulario */}
      <form onSubmit={onAdd} className="grid grid-cols-1 gap-3 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded p-2"
            name="name"
            placeholder="Nombre del destinatario"
            value={form.name}
            onChange={onChange}
            required
          />
          <input
            className="border rounded p-2"
            name="phone"
            placeholder="Teléfono"
            value={form.phone}
            onChange={onChange}
          />
        </div>
        <input
          className="border rounded p-2"
          name="addressLine"
          placeholder="Dirección"
          value={form.addressLine}
          onChange={onChange}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border rounded p-2"
            name="city"
            placeholder="Cantón / Ciudad"
            value={form.city}
            onChange={onChange}
          />
          <input
            className="border rounded p-2"
            name="province"
            placeholder="Provincia"
            value={form.province}
            onChange={onChange}
          />
          <input
            className="border rounded p-2"
            name="zip"
            placeholder="Código Postal"
            value={form.zip}
            onChange={onChange}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Agregar dirección"}
        </button>
      </form>

      {/* Lista de direcciones */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-gray-600">Cargando…</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-gray-600">No tienes direcciones registradas.</div>
        ) : (
          list.map((addr) => {
            const key = addr?._id ?? addr?.id ?? `${addr?.province}-${addr?.city}-${addr?.addressLine}`;
            return (
              <div key={key} className="border rounded p-3 flex items-start justify-between gap-3">
                <div className="text-sm">
                  <div className="font-medium">{addr?.name || "(Sin nombre)"}</div>
                  <div>{addr?.addressLine}</div>
                  <div>
                    {[addr?.city, addr?.province, addr?.zip].filter(Boolean).join(", ")}
                  </div>
                  {addr?.phone && <div>📞 {addr.phone}</div>}
                </div>
                <button
                  onClick={() => onDelete(addr?._id ?? addr?.id)}
                  className="px-3 py-1 rounded bg-white border hover:bg-gray-50"
                >
                  Eliminar
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );


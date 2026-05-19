import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TimbangGudang = () => {
  const navigate = useNavigate();
  const [rfid, setRfid] = useState(null);
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bruto: "",
  });
  const [timbangMuatList, setTimbangMuatList] = useState([]);

  // ✅ fetch RFID
  const fetchRFID = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://38.147.122.240:5000/api/rfid/latest");
      if (res.data.truck) {
        setRfid(res.data.truck.truckId);
        setTruck(res.data.truck);
        fetchTimbangMuat(res.data.truck.truckId);
      }
    } catch (err) {
      console.error("❌ Error fetch RFID:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // polling RFID
  useEffect(() => {
    const interval = setInterval(() => {
      if (!rfid) fetchRFID();
    }, 2000);
    return () => clearInterval(interval);
  }, [rfid, fetchRFID]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Ambil semua data timbang muat
  const fetchTimbangMuat = async (truckId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/loadings/${truckId}`
      );
      setTimbangMuatList(res.data);
    } catch (err) {
      console.error("❌ Error fetch timbang muat:", err);
    }
  };

  // ✅ Submit Brutto -> API PUT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!timbangMuatList.length) {
      alert("Belum ada data timbang muat untuk truk ini!");
      return;
    }

    const brutoVal = parseFloat(form.bruto);
    if (isNaN(brutoVal) || brutoVal <= 0) {
      alert("Brutto harus diisi dengan angka lebih dari 0");
      return;
    }

    const lastData = timbangMuatList[timbangMuatList.length - 1]; // ambil record terakhir
    const id = lastData.id;

    try {
      setSubmitting(true);
      const res = await axios.put(
        `http://localhost:5000/api/loadings/${id}/brutto`,
        { bruto: brutoVal }
      );
      alert(res.data.message || "Data brutto & netto berhasil disimpan!");
      setForm({ bruto: "" });
      fetchTimbangMuat(rfid);
    } catch (err) {
      console.error("❌ Error simpan bruto:", err);
      alert(
        err.response?.data?.message || "Gagal menyimpan data timbang gudang"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-green-100 to-white">
      <h1 className="text-3xl font-bold text-center mb-8">⚖️ Timbang Gudang</h1>

      {loading && (
        <div className="flex justify-center items-center my-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
        </div>
      )}

      {!truck && !loading && (
        <div className="text-center text-lg text-gray-600 mb-8">
          🔄 Menunggu scan RFID...
        </div>
      )}

      {truck && (
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600 text-center">
            Data Truk
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <strong>Truck ID:</strong> {truck.truckId}
            </div>
            <div>
              <strong>Driver:</strong> {truck.driver}
            </div>
            <div>
              <strong>Tipe Truck:</strong> {truck.truckType}
            </div>
            <div>
              <strong>Tanggal:</strong> {truck.date?.split("T")[0]}
            </div>
          </div>

          {/* FORM INPUT BRUTTO */}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label>Brutto (kg):</label>
              <input
                type="number"
                name="bruto"
                value={form.bruto}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
                min="0"
              />
            </div>

            <div className="col-span-2 flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                disabled={submitting}
              >
                Kembali
              </button>
              <button
                type="submit"
                className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>

          {/* TABEL RIWAYAT */}
          <div className="mt-10">
            <h3 className="text-lg font-bold mb-3">Riwayat Timbang Gudang:</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300">
                <thead className="bg-green-200">
                  <tr>
                    <th className="p-2 border">Truck ID</th>
                    <th className="p-2 border">Driver</th>
                    <th className="p-2 border">Jenis Barang</th>
                    <th className="p-2 border">Jumlah</th>
                    <th className="p-2 border">Tara</th>
                    <th className="p-2 border">Brutto</th>
                    <th className="p-2 border">Netto</th>
                  </tr>
                </thead>
                <tbody>
                  {timbangMuatList.length ? (
                    timbangMuatList.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="p-2 border">{truck.truckId}</td>
                        <td className="p-2 border">{truck.driver}</td>
                        <td className="p-2 border">{item.itemType}</td>
                        <td className="p-2 border">{item.quantity || "-"}</td>
                        <td className="p-2 border">{item.tara ?? 0} kg</td>
                        <td className="p-2 border">{item.bruto ?? "-"} kg</td>
                        <td className="p-2 border font-semibold">
                          {item.netto ?? "-"} kg
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-4 text-center text-gray-500"
                      >
                        Belum ada data timbang gudang.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimbangGudang;

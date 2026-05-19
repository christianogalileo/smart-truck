import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TimbangMuat = () => {
  const navigate = useNavigate();
  const [rfid, setRfid] = useState(null);
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemType: '',
    quantity: '',
    tara: ''
  });
  const [timbangMuatList, setTimbangMuatList] = useState([]);

  // ✅ pakai useCallback biar aman dari warning eslint
  const fetchRFID = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://38.147.122.240:5000/api/rfid/latest');
      if (res.data.truck) {
        setRfid(res.data.truck.truckId);
        setTruck(res.data.truck);
        fetchTimbangMuat(res.data.truck.truckId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // polling RFID terus sampai dapat kartu baru
  useEffect(() => {
    const interval = setInterval(() => {
      if (!rfid) {
        fetchRFID();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [rfid, fetchRFID]); // ✅ sudah benar

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      truckId: rfid,
      itemType: form.itemType,
      quantity: form.quantity,
      tara: form.tara,
      unit: 'Kg' // default satuan
    };

    try {
      await axios.post('http://localhost:5000/api/loadings', payload);
      alert("Data tara berhasil disimpan!");
      setForm({ itemType: '', quantity: '', tara: '' });
      fetchTimbangMuat(rfid);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data timbang muat");
    }
  };

  const fetchTimbangMuat = async (truckId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/loadings/${truckId}`);
      setTimbangMuatList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-100 to-white">
      <h1 className="text-3xl font-bold text-center mb-8">📦 Timbang Muat</h1>

      {loading && (
        <div className="flex justify-center items-center my-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      )}

      {!truck && !loading && (
        <div className="text-center text-lg text-gray-600 mb-8">
          🔄 Menunggu scan RFID...
        </div>
      )}

      {truck && (
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 text-center">Data Truk</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><strong>Truck ID:</strong> {truck.truckId}</div>
            <div><strong>Driver:</strong> {truck.driver}</div>
            <div><strong>Tipe Truck:</strong> {truck.truckType}</div>
            <div><strong>Tanggal:</strong> {truck.date?.split('T')[0]}</div>
          </div>

          {/* FORM INPUT TARA SAJA */}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label>Jenis Barang:</label>
              <input
                type="text"
                name="itemType"
                value={form.itemType}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label>Jumlah Barang:</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label>Tara (kg):</label>
              <input
                type="number"
                name="tara"
                value={form.tara}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div className="col-span-2 flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Simpan
              </button>
            </div>
          </form>

          {/* TABEL RIWAYAT */}
          <div className="mt-10">
            <h3 className="text-lg font-bold mb-3">Riwayat Timbang Muat:</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300">
                <thead className="bg-blue-200">
                  <tr>
                    <th className="p-2 border">Truck ID</th>
                    <th className="p-2 border">Driver</th>
                    <th className="p-2 border">Tipe Truck</th>
                    <th className="p-2 border">Jenis Barang</th>
                    <th className="p-2 border">Jumlah</th>
                    <th className="p-2 border">Tara</th>
                    <th className="p-2 border">Bruto</th>
                    <th className="p-2 border">Netto</th>
                  </tr>
                </thead>
                <tbody>
                  {timbangMuatList.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="p-2 border">{truck.truckId}</td>
                      <td className="p-2 border">{truck.driver}</td>
                      <td className="p-2 border">{truck.truckType}</td>
                      <td className="p-2 border">{item.itemType}</td>
                      <td className="p-2 border">{item.quantity}</td>
                      <td className="p-2 border">{item.tara ? `${item.tara} kg` : '-'}</td>
                      <td className="p-2 border">{item.bruto ? `${item.bruto} kg` : '-'}</td>
                      <td className="p-2 border font-semibold">{item.netto ? `${item.netto} kg` : '-'}</td>
                    </tr>
                  ))}
                  {timbangMuatList.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-gray-500">
                        Belum ada data timbang muat.
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

export default TimbangMuat;

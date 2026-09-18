"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Mahasiswa = {
  nama: string;
  prodi: string;
  nim: string;
};

type FormData = {
  nomorSurat: string;
  tanggalSurat: string;

  nama: string;
  jabatan: string;
  nuptk: string;

  penugasan: string;
  namaKegiatan: string;
  tempatKegiatan: string;

  tanggalMulai: string;
  tanggalSelesai: string;

  tingkat: string;

  mahasiswa: Mahasiswa[];
};

const bulanRomawi: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
  11: "XI",
  12: "XII",
};

function formatTanggal(tanggal: string) {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SuratPage() {
  
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState<FormData>({
    nomorSurat: "",
    tanggalSurat: new Date().toISOString().split("T")[0],

    nama: "",
    jabatan: "",
    nuptk: "",

    penugasan: "",
    namaKegiatan: "",
    tempatKegiatan: "",

    tanggalMulai: "",
    tanggalSelesai: "",

    tingkat: "Internasional",

    mahasiswa: [],
  });

  function handleChange(
    field: keyof FormData,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleMahasiswaChange(
    index: number,
    field: keyof Mahasiswa,
    value: string
  ) {
    const mahasiswa = [...form.mahasiswa];

    mahasiswa[index] = {
      ...mahasiswa[index],
      [field]: value,
    };

    setForm((prev) => ({
      ...prev,
      mahasiswa,
    }));
  }

  function tambahMahasiswa() {
    setForm((prev) => ({
      ...prev,
      mahasiswa: [
        ...prev.mahasiswa,
        {
          nama: "",
          prodi: "",
          nim: "",
        },
      ],
    }));
  }

  function hapusMahasiswa(index: number) {
    setForm((prev) => ({
      ...prev,
      mahasiswa: prev.mahasiswa.filter(
        (_, i) => i !== index
      ),
    }));
  }

  function handlePreview() {
    setShowPreview(true);

    setTimeout(() => {
      document
        .getElementById("preview-surat")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  }

  async function generatePDF() {
    const element = document.getElementById("surat-document");

    if (!element) {
      alert("Silakan preview surat terlebih dahulu.");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;

      const margin = 0;

      const imgWidth = pageWidth - margin * 2;
      const imgHeight =
        (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -= pageHeight;
      }

      const namaFile = form.nomorSurat
        ? `Surat-Tugas-${form.nomorSurat.replace(
            /[\/\\]/g,
            "-"
          )}.pdf`
        : "Surat-Tugas.pdf";

      pdf.save(namaFile);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);

      alert(
        "Gagal membuat PDF. Silakan buka Console browser untuk melihat detail error."
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Generate Surat Tugas
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Isi data berikut untuk membuat surat tugas
            secara otomatis.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">

          {/* ================= FORM ================= */}

          <section className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            {/* DATA SURAT */}

            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Data Surat
            </h2>

            <div className="space-y-4">

              <div>

                <Input
                  label="Nomor Surat"
                  value={form.nomorSurat}
                  onChange={(value) =>
                    handleChange("nomorSurat", value)
                  }
                  placeholder="Contoh: 419/SWRIII/VIII/2026"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tanggal Surat
                </label>

                <input
                  type="date"
                  value={form.tanggalSurat}
                  onChange={(e) =>
                    handleChange(
                      "tanggalSurat",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
              </div>

            </div>

            <hr className="my-6" />

            {/* DATA ORANG */}

            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Data yang Ditugaskan
            </h2>

            <div className="space-y-4">

              <Input
                label="Nama"
                value={form.nama}
                onChange={(value) =>
                  handleChange("nama", value)
                }
                placeholder="Nama lengkap"
              />

              <Input
                label="Jabatan"
                value={form.jabatan}
                onChange={(value) =>
                  handleChange("jabatan", value)
                }
                placeholder="Contoh: Dosen Program Studi Arsitektur"
              />

              <Input
                label="NUPTK"
                value={form.nuptk}
                onChange={(value) =>
                  handleChange("nuptk", value)
                }
                placeholder="Nomor NUPTK"
              />

            </div>

            <hr className="my-6" />

            {/* PENUGASAN */}

            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Data Penugasan
            </h2>

            <div className="space-y-4">

              <Input
                label="Penugasan / Peran"
                value={form.penugasan}
                onChange={(value) =>
                  handleChange("penugasan", value)
                }
                placeholder="Contoh: Dosen Pendamping Tim Mahasiswa"
              />

              <Input
                label="Nama Kegiatan"
                value={form.namaKegiatan}
                onChange={(value) =>
                  handleChange(
                    "namaKegiatan",
                    value
                  )
                }
                placeholder="Nama kegiatan"
              />

              <Input
                label="Tempat Kegiatan"
                value={form.tempatKegiatan}
                onChange={(value) =>
                  handleChange(
                    "tempatKegiatan",
                    value
                  )
                }
                placeholder="Contoh: Bali, Indonesia"
              />

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tanggal Mulai
                  </label>

                  <input
                    type="date"
                    value={form.tanggalMulai}
                    onChange={(e) =>
                      handleChange(
                        "tanggalMulai",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tanggal Selesai
                  </label>

                  <input
                    type="date"
                    value={form.tanggalSelesai}
                    onChange={(e) =>
                      handleChange(
                        "tanggalSelesai",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tingkat
                </label>

                <select
                  value={form.tingkat}
                  onChange={(e) =>
                    handleChange(
                      "tingkat",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option>Internasional</option>
                  <option>Nasional</option>
                  <option>Regional</option>
                  <option>Universitas</option>
\                </select>
              </div>

            </div>

            <hr className="my-6" />

            {/* MAHASISWA */}

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Data Mahasiswa
              </h2>

              <button
                type="button"
                onClick={tambahMahasiswa}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Tambah
              </button>
            </div>

            <div className="space-y-4">
              {form.mahasiswa.map((mhs, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Mahasiswa {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => hapusMahasiswa(index)}
                      className="text-xs text-red-500"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="space-y-3">
                    <Input
                      label="Nama"
                      value={mhs.nama}
                      onChange={(value) =>
                        handleMahasiswaChange(index, "nama", value)
                      }
                      placeholder="Nama mahasiswa"
                    />

                    <Input
                      label="Program Studi"
                      value={mhs.prodi}
                      onChange={(value) =>
                        handleMahasiswaChange(index, "prodi", value)
                      }
                      placeholder="Contoh: Informatika"
                    />

                    <Input
                      label="NIM"
                      value={mhs.nim}
                      onChange={(value) =>
                        handleMahasiswaChange(index, "nim", value)
                      }
                      placeholder="Nomor mahasiswa"
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* BUTTON */}

            <button
              type="button"
              onClick={handlePreview}
              className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Preview Surat
            </button>

          </section>

          {/* ================= PREVIEW ================= */}

          <section
            id="preview-surat"
            className="rounded-xl border border-gray-200 bg-gray-200 p-6"
          >

            {!showPreview ? (
              <div className="flex min-h-[700px] items-center justify-center text-center">
                <div>
                  <p className="font-medium text-gray-500">
                    Preview Surat
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Isi form di sebelah kiri lalu klik
                    &quot;Preview Surat&quot;.
                  </p>
                </div>
              </div>
            ) : (

              <div 
                id="surat-document"
                className="mx-auto max-w-[794px] bg-white px-16 py-16 text-[12px] leading-relaxed text-black shadow-lg"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                }}
                >

                {/* JUDUL */}

                <div className="text-center mt-12">
                  <h1 className="text-[20px] underline font-bold">
                    SURAT TUGAS
                  </h1>

                  <p className="mt-1">
                    No. {form.nomorSurat || "-"}
                  </p>
                </div>

                {/* PEMBUKA */}

                <p className="mt-8 text-justify">
                  Dalam rangka meningkatkan pembimbingan prestasi dan pengembangan <i>soft skill</i> mahasiswa, maka Wakil Rektor bidang Kemahasiswaan, <i>Employability</i>, dan Kewirausahaan Universitas Multimedia Nusantara menugaskan nama dibawah ini:
                </p>

                {/* DATA ORANG */}

                <table className="mt-5 w-full">
                  <tbody>

                    <tr>
                      <td className="w-32 align-top">
                        Nama
                      </td>
                      <td className="w-4 align-top">
                        :
                      </td>
                      <td>
                        {form.nama || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Jabatan
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.jabatan || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        NUPTK
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.nuptk || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-32 align-top">
                        Penugasan
                      </td>
                      <td className="w-4 align-top">
                        :
                      </td>
                      <td>
                        {form.penugasan || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Nama Kegiatan
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.namaKegiatan || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Tempat Kegiatan
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.tempatKegiatan || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Tanggal Kegiatan
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.tanggalMulai
                          ? formatTanggal(
                              form.tanggalMulai
                            )
                          : "-"}

                        {form.tanggalSelesai &&
                          ` s.d. ${formatTanggal(
                            form.tanggalSelesai
                          )}`}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Tingkat
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.tingkat}
                      </td>
                    </tr>

                    <tr>
                    <td className="W-32 align-top whitespace-nowrap">
                        Nama Mahasiswa
                    </td>

                    <td className="W-4 align-top">
                        :
                    </td>

                    <td>
                        {form.mahasiswa.map((mhs, index) => (
                        <div
                            key={index}
                            className="flex"
                        >
                            <span className="w-[28px] shrink-0">
                            {index + 1}.
                            </span>

                            <span className="min-w-0 flex-1">
                            {mhs.nama || "-"}
                            </span>

                            <span className="w-[210px] shrink-0 whitespace-nowrap">
                            ({mhs.prodi || "-"}/{mhs.nim || "-"})
                            </span>
                        </div>
                        ))}
                    </td>
                    </tr>
                </tbody>
                </table>
                
                {/* PENUTUP */}

                <p className="mt-6 text-justify">
                  Demikian surat tugas ini disusun agar
                  dapat dipergunakan sebagaimana mestinya.
                </p>

                {/* TANDA TANGAN */}

                <div className="mt-10 w-64 text-left">

                  <p>
                    Tangerang,{" "}
                    {formatTanggal(
                      form.tanggalSurat
                    )}
                  </p>


                  <div className="h-16" />

                  <p className="font-semibold underline">
                    Ika Yanuarti, S.E., M.S.F., Ph.D.
                  </p>
                  <p>
                    Wakil Rektor Bidang <i>Student Engagement</i>,
                  </p>
                  <p>
                    <i>Employability</i>, & <i>Entrepreneurship</i>
                  </p>

                </div>
              </div>
            )}
            <div className="mt-12 flex gap-3 border-t pt-5">

                    <button
                        type="button"
                        onClick={generatePDF}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                        Generate PDF
                    </button>

                  {/* <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Generate DOCX
                  </button> */}

                </div>
          </section>

        </div>
      </div>
    </main>
  );
}

/* ================= INPUT COMPONENT ================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black"
      />
    </div>
  );
}


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

  Mahasiswa: [];

  namaLomba: string;
  penyelenggara: string;
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

    Mahasiswa: [],
    namaLomba: "",
    penyelenggara: "",
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

    const suratLampiran = document.getElementById(
      "surat-lampiran"
    );

    if (suratLampiran && form.mahasiswa.length > 6) {
      const canvasLampiran = await html2canvas(
        suratLampiran,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        }
      );

      const imgLampiran =
        canvasLampiran.toDataURL("image/png");

      const lampiranWidth = pageWidth;
      const lampiranHeight =
        (canvasLampiran.height * lampiranWidth) /
        canvasLampiran.width;

      let lampiranHeightLeft = lampiranHeight;
      let lampiranPosition = 0;

      // Selalu mulai halaman baru
      pdf.addPage();

      pdf.addImage(
        imgLampiran,
        "PNG",
        0,
        lampiranPosition,
        lampiranWidth,
        lampiranHeight
      );

      lampiranHeightLeft -= pageHeight;

      while (lampiranHeightLeft > 0) {
        lampiranPosition =
          lampiranHeightLeft - lampiranHeight;

        pdf.addPage();

        pdf.addImage(
          imgLampiran,
          "PNG",
          0,
          lampiranPosition,
          lampiranWidth,
          lampiranHeight
        );

        lampiranHeightLeft -= pageHeight;
      }
    }

      const nomorSurat = form.nomorSurat
        ? `${form.nomorSurat}-SWRIII-IX-2026`
        : "Tanpa-Nomor";

      const namaKegiatan = form.namaLomba
        ? form.namaLomba
            .replace(/[\/\\:*?"<>|]/g, "-")
            .trim()
        : "Nama-Kegiatan";

      const namaMahasiswa = form.mahasiswa[0]?.nama
        ? form.mahasiswa[0].nama
            .replace(/[\/\\:*?"<>|]/g, "-")
            .trim()
        : "Mahasiswa";

      const namaFile = `Surat-Tugas-${nomorSurat} (${namaKegiatan} - ${namaMahasiswa}).pdf`;

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
                  placeholder="123"
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

               {form.mahasiswa.map((mahasiswa, index) => (
                <div key={index} className="space-y-3 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                      {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          mahasiswa: prev.mahasiswa.filter(
                            (_, i) => i !== index
                          ),
                        }));
                      }}
                      className="rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="flex-1">
                    <Input
                      label="Nama Mahasiswa"
                      value={mahasiswa.nama}
                      onChange={(value) => {
                        setForm((prev) => ({
                          ...prev,
                          mahasiswa: prev.mahasiswa.map((item, i) =>
                            i === index
                              ? { ...item, nama: value }
                              : item
                          ),
                        }));
                      }}
                      placeholder="Nama Lengkap"
                    />
                    <Input
                      label="NIM"
                      value={mahasiswa.nim}
                      onChange={(value) => {
                        setForm((prev) => ({
                          ...prev,
                          mahasiswa: prev.mahasiswa.map((item, i) =>
                            i === index
                              ? { ...item, nim: value }
                              : item
                          ),
                        }));
                      }}
                      placeholder="NIM"
                    />

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Program Studi
                      </label>

                      <select
                        value={mahasiswa.prodi}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            mahasiswa: prev.mahasiswa.map((item, i) =>
                              i === index
                                ? { ...item, prodi: e.target.value }
                                : item
                            ),
                          }));
                        }}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Pilih Program Studi</option>
                        <option value="Perhotelan">Perhotelan</option>
                        <option value="Akuntansi">Akuntansi</option>
                        <option value="Manajemen">Manajemen</option>
                        <option value="Magister Manajemen Teknologi">Magister Manajemen Teknologi</option>
                        <option value="Doktoral Manajemen Teknologi">Doktoral Manajemen Teknologi</option>
                        <option value="Komunikasi Strategis">Komunikasi Strategis</option>
                        <option value="Jurnalistik">Jurnalistik</option>
                        <option value="PJJ Ilmu Komunikasi">PJJ Ilmu Komunikasi</option>
                        <option value="Magister Ilmu Komunikasi">Magister Ilmu Komunikasi</option>
                        <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                        <option value="Film dan Animasi">Film dan Animasi</option>
                        <option value="Arsitektur">Arsitektur</option>
                        <option value="Program Profesi Arsitektur">Program Profesi Arsitektur</option>
                        <option value="Magister Desain">Magister Desain</option>
                        <option value="Informatika">Informatika</option>
                        <option value="Sistem Informasi">Sistem Informasi</option>
                        <option value="Teknik Komputer">Teknik Komputer</option>
                        <option value="Teknik Fisika">Teknik Fisika</option>
                        <option value="Teknik Elektro">Teknik Elektro</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>

                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    mahasiswa: [
                      ...prev.mahasiswa,
                      {
                        nama: "",
                        nim: "",
                        prodi: "",
                      },
                    ],
                  }));
                }}
                className="text-left text-sm font-medium text-gray-700 hover:text-black"
              >
                + Tambah Mahasiswa
              </button>

              <Input
                label="Nama Lomba"
                value={form.namaLomba}
                onChange={(value) =>
                  handleChange(
                    "namaLomba",
                    value
                  )
                }
                placeholder="Nama Lomba"
              />
              <Input
                label="Penyelenggara"
                value={form.penyelenggara}
                onChange={(value) =>
                  handleChange("penyelenggara", value)
                }
                placeholder="Contoh: Universitas Multimedia Nusantara"
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
                </select>
              </div>

            </div>

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
              <div>
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
                    No. {form.nomorSurat + "-SWRIII-IX-2026"}
                  </p>
                </div>

                {/* PEMBUKA */}

                <p className="mt-8 text-justify">
                  Dengan ini Universitas Multimedia Nusantara memberika tugas kepada nama-nama dibawah ini untuk menjadi delegasi Universitas Multimedia Nusantara:
                </p>

                {/* DATA ORANG */}

                <table className="mt-5 w-full">
                  <tbody>
                    {form.mahasiswa.length > 0 && (
                      <tr>
                        <td className="w-32 align-top whitespace-nowrap">
                          Nama Mahasiswa
                        </td>

                        <td className="w-4 align-top">
                          :
                        </td>

                        <td className="align-top">
                          {form.mahasiswa.length > 6 ? (
                            <span className="italic">
                              Terlampir
                            </span>
                          ) : (
                            form.mahasiswa.map((mahasiswa, index) => (
                              <div key={index} className="flex">
                                <span className="w-7 shrink-0">
                                  {index + 1}.
                                </span>

                                <span className="flex-1">
                                  {mahasiswa.nama || "-"}{" "}
                                  ({mahasiswa.nim || "-"} -{" "}
                                  {mahasiswa.prodi || "-"})
                                </span>
                              </div>
                            ))
                          )}
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td className="w-32 align-top">
                        Nama Lomba
                      </td>
                      <td className="w-4 align-top">
                        :
                      </td>
                      <td>
                        {form.namaLomba || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Penyelenggara
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.penyelenggara || "-"}
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
                          ? formatTanggal(form.tanggalMulai)
                          : "-"}

                        {form.tanggalSelesai &&
                          ` s.d. ${formatTanggal(form.tanggalSelesai)}`}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Tempat
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
                        Tingkat
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.tingkat}
                      </td>
                    </tr>

                  </tbody>
                </table>

                {/* PENUTUP */}

                <p className="mt-6 text-justify">
                  Mengingat kegiatan tersebut di atas berguna bagi kegiatan perkembangan <i>soft skills</i> dan prestasi mahasiswa, maka mohon agar surat keterangan ini dapat dipergunakan sebagaimana mestinya.
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
              
              {form.mahasiswa.length > 6 && (
                <div
                  id="surat-lampiran"
                  className="mt-10 bg-white px-[20mm] py-[20mm]"
                >
                  <div className="text-center">
                    <h2 className="text-lg font-bold">
                      LAMPIRAN
                    </h2>

                    <h3 className="mt-2 text-base font-bold">
                      DAFTAR PESERTA LOMBA {form.namaLomba || "-"}
                    </h3>
                  </div>

                  <table className="mt-8 w-full border-collapse border-[0.2px] border-black text-sm">
                    <thead>
                      <tr>
                        <th className="w-12 border-[0.2px] border-black px-2 py-2">
                          No.
                        </th>
                        <th className="border-[0.2px] border-black px-3 py-2 text-left">
                          Nama Mahasiswa
                        </th>
                        <th className="border-[0.2px] border-black px-3 py-2 text-left">
                          NIM
                        </th>
                        <th className="border-[0.2px] border-black px-3 py-2 text-left">
                          Program Studi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {form.mahasiswa.map((mahasiswa, index) => (
                        <tr key={index}>
                          <td className="border-[0.2px] border-black px-2 py-2 text-center">
                            {index + 1}
                          </td>

                          <td className="border-[0.2px] border-black px-3 py-2">
                            {mahasiswa.nama || "-"}
                          </td>

                          <td className="border-[0.2px] border-black px-3 py-2">
                            {mahasiswa.nim || "-"}
                          </td>

                          <td className="border-[0.2px] border-black px-3 py-2">
                            {mahasiswa.prodi || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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


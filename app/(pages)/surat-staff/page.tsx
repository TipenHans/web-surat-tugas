"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Link from "next/link";


type FormData = {
  nomorSurat: string;
  tanggalSurat: string;

  nama1: string;
  jabatan1: string;
  nama2: string;
  jabatan2: string;

  divisi: string;
  tugas: string;
  tempat: string;
  penyelenggara: string;

  tanggalMulai: string;
  tanggalSelesai: string;
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

    nama1: "",
    jabatan1: "",
    nama2: "",
    jabatan2: "",
    
    divisi: "",
    tugas: "",
    tempat: "",
    penyelenggara: "",

    tanggalMulai: "",
    tanggalSelesai: "",
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

      const nomorSurat = form.nomorSurat
        ? `${form.nomorSurat}`
        : "Tanpa-Nomor";

      const namaKegiatan = form.tugas
        ? form.tugas
            .replace(/[\/\\:*?"<>|]/g, "-")
            .trim()
        : "Tugas";
      const namaStaff = form.nama2
        ? form.nama2
            .replace(/[\/\\:*?"<>|]/g, "-")
            .trim()
        : "NamaStaff";


      const namaFile = `Surat-Tugas-${nomorSurat} (${namaKegiatan} - ${namaStaff}).pdf`;

      pdf.save(namaFile);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);

      alert(
        "Gagal membuat PDF."
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Generate Surat Tugas
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Isi data berikut untuk membuat surat tugas
            secara otomatis.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/generate-surat"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900"
          >
            Dosen
          </Link>

          <Link
            href="/surat-tugas-mahasiswa"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900"
          >
            Mahasiswa
          </Link>

          <Link
            href="/surat-staff"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900"
          >
            Staff
          </Link>
        </div>

        <div className="mt-4 grid gap-8 lg:grid-cols-[420px_1fr]">

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
                  placeholder="Nomor"
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
              Data yang Menugaskan
            </h2>

            <div className="space-y-4">

              <Input
                label="Nama"
                value={form.nama1}
                onChange={(value) =>
                  handleChange("nama1", value)
                }
                placeholder="Nama lengkap"
              />

              <Input
                label="Jabatan"
                value={form.jabatan1}
                onChange={(value) =>
                  handleChange("jabatan1", value)
                }
                placeholder="Contoh: Student Engagement"
              />
            </div>

            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Data yang Ditugaskan
            </h2>

            <div className="space-y-4">

              <Input
                label="Nama"
                value={form.nama2}
                onChange={(value) =>
                  handleChange("nama2", value)
                }
                placeholder="Nama lengkap"
              />

              <Input
                label="Divisi"
                value={form.jabatan2}
                onChange={(value) =>
                  handleChange("jabatan2", value)
                }
                placeholder="Contoh: Student Engagement"
              />
            </div>

            <hr className="my-6" />

            {/* PENUGASAN */}

            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Data Penugasan
            </h2>

            <div className="space-y-4">

              <Input
                label="Tugas yang diberikan"
                value={form.tugas}
                onChange={(value) =>
                  handleChange("tugas", value)
                }
                placeholder="Contoh: Dosen Pendamping Tim Mahasiswa"
              />

              <Input
                label="Tempat Kegiatan"
                value={form.tempat}
                onChange={(value) =>
                  handleChange(
                    "tempat",
                    value
                  )
                }
                placeholder="Tempat kegiatan"
              />

              <Input
                label="Penyelenggara"
                value={form.penyelenggara}
                onChange={(value) =>
                  handleChange(
                    "penyelenggara",
                    value
                  )
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
                    No. {form.nomorSurat}
                  </p>
                </div>

                {/* PEMBUKA */}

                <p className="mt-8 text-justify">
                  Yang menugaskan :
                </p>

                {/* DATA ORANG */}

                <table className="ml-4 w-full">
                  <tbody>

                    <tr>
                      <td className="w-32 align-top">
                        Nama
                      </td>
                      <td className="w-4 align-top">
                        :
                      </td>
                      <td>
                        {form.nama1|| "-"}
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
                        {form.jabatan1 || "-"}
                      </td>
                    </tr>
                    </tbody>
                </table>

                <p className="mt-8 text-justify">
                  Yang diberi tugas :
                </p>
                <table className="ml-4 w-full">
                  <tbody>
                    <tr>
                      <td className="w-32 align-top">
                        Nama
                      </td>
                      <td className="w-4 align-top">
                        :
                      </td>
                      <td>
                        {form.nama2|| "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Divisi
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.jabatan2 || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-32 align-top">
                        Tugas yang diberikan
                      </td>
                      <td className="w-4 align-top">
                        :
                      </td>
                      <td className="align-top min-w-0 break-words whitespace-normal">
                        {form.tugas || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Tempat
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td className="align-top min-w-0 break-words whitespace-normal">
                        {form.tempat || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Penyelenggara
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td className="align-top min-w-0 break-words whitespace-normal">
                        {form.penyelenggara || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="align-top">
                        Lama Tugas
                      </td>
                      <td className="align-top">
                        :
                      </td>
                      <td>
                        {form.tanggalMulai
                            ? formatTanggal(form.tanggalMulai)
                            : "-"}

                        {form.tanggalSelesai &&
                            form.tanggalSelesai !== form.tanggalMulai &&
                            ` s.d. ${formatTanggal(form.tanggalSelesai)}`}
                        </td>
                    </tr>
                </tbody>
                </table>

                {/* TANDA TANGAN */}

                <div className="mt-10 w-64 text-left">

                  <p>
                    Tangerang,{" "}
                    {formatTanggal(
                      form.tanggalSurat
                    )}
                  </p>
                  <p>Yang memberi tugas,</p>


                  <div className="h-12" />

                  <p className="font-semibold underline">
                    {form.nama1|| "-"}
                  </p>
                  <p>
                    {form.jabatan1|| "-"}
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


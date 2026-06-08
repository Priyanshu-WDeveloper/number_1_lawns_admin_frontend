import { useState, type ReactNode } from 'react';
import { FileText, User } from 'lucide-react';
import { DocumentRow } from './document-row';
import { DocumentPreviewModal } from './document-preview-modal';
import { ReviewField } from './review-field';
import type { NamedDoc } from './named-document-upload';

interface ReviewFieldDef {
  icon: ReactNode;
  label: string;
  value: string | number;
}

interface ReviewSection {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  imageFields?: Array<{ label: string; src: string; alt: string }>;
  fields?: ReviewFieldDef[];
  documents?: NamedDoc[];
  attachments?: Array<{ key: string; value: string }>;
}

interface ReviewCardProps {
  sections: ReviewSection[];
}

export function ReviewCard({ sections }: ReviewCardProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const handlePreview = (doc: NamedDoc) => {
    if (doc.file) setPreviewFile(doc.file);
  };

  return (
    <div className="space-y-5">
      {sections.map((section, idx) => {
        const hasDocs =
          section.documents && section.documents.some((d) => d.file);

        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-3.5">
                <div className="w-[42px] h-[42px] rounded-xl bg-[#2d6a4f] flex items-center justify-center shrink-0">
                  {section.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#111827]">
                    {section.title}
                  </div>
                  {section.subtitle && (
                    <div className="text-xs text-[#6b7280] mt-0.5">
                      {section.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(section.fields && section.fields.length > 0) ||
            (section.imageFields && section.imageFields.length > 0) ? (
              <div className="p-6">
                {section.imageFields && section.imageFields.length > 0 && (
                  <div className="space-y-4">
                    {section.imageFields.map((img, ii) => (
                      <div key={ii}>
                        <p className="text-xs text-[#6b7280] mb-1.5">
                          {img.label}
                        </p>
                        {imgErrors[ii] ? (
                          <div className="h-14 w-14 rounded-full border-2 border-border bg-muted flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        ) : (
                          <img
                            src={img.src}
                            alt={img.alt}
                            onError={() =>
                              setImgErrors((prev) => ({ ...prev, [ii]: true }))
                            }
                            className="h-14 w-14 rounded-full object-cover border-2 border-border"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {section.fields && section.fields.length > 0 && (
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${
                      section.imageFields && section.imageFields.length > 0
                        ? 'mt-5 pt-5 border-t border-[#e5e7eb]'
                        : ''
                    }`}
                  >
                    {section.fields.map((field, fi) => (
                      <ReviewField
                        key={fi}
                        icon={field.icon}
                        label={field.label}
                        value={field.value}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {section.attachments && section.attachments.length > 0 && (
              <div className="px-6 pb-4 space-y-3">
                <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                  Existing Documents
                </p>
                <div className="flex flex-wrap gap-2">
                  {section.attachments.map((att, ai) => (
                    <a
                      key={ai}
                      href={att.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs text-[#374151] hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#6b7280]" />
                      {att.key}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {hasDocs && (
              <div className="px-6 pb-6 space-y-3">
                {section.documents!
                  .filter((d) => d.file)
                  .map((doc, di) => (
                    <DocumentRow
                      key={di}
                      doc={doc}
                      onPreview={handlePreview}
                    />
                  ))}
              </div>
            )}
          </div>
        );
      })}

      <DocumentPreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

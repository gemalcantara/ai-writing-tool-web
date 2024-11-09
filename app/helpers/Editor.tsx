"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface EditorProps {
    data: string;
    onChange: (event: any, editor: any) => void;
}  

const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  return (
    <div className="mb-4">
      <CKEditor
        editor={ClassicEditor}
        data={data}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange(data,editor);
        }}
      />
    </div>
  );
};

export default Editor;
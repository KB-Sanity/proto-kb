export function pickFile(accept?: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('input');
    el.style.display = 'none';
    el.type = 'file';

    if (accept) {
      el.accept = accept;
    }

    el.addEventListener('change', () => {
      if (el.files) {
        resolve(el.files[0]);
      } else {
        reject();
      }
    });

    const teardown = () => {
      document.body.removeEventListener('focus', teardown, true);
      setTimeout(() => {
        document.body.removeChild(el);
      }, 1000);
    };
    document.body.addEventListener('focus', teardown, true);

    document.body.appendChild(el);
    el.click();
  });
}

export function saveFile(text: string, name: string) {
  const blob = new Blob([text]);
  const saver = document.createElementNS('http://www.w3.org/1999/xhtml', 'a') as HTMLAnchorElement;
  saver.href = URL.createObjectURL(blob);

  saver.download = name;

  document.body.appendChild(saver);
  saver.dispatchEvent(new MouseEvent('click'));
  document.body.removeChild(saver);
  URL.revokeObjectURL(saver.href);
}

export function fileToText(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event: ProgressEvent) => {
      const reader = event.target as FileReader;
      resolve(reader.result);
    };
    fileReader.onerror = (event: ProgressEvent) => {
      const reader = event.target as FileReader;
      reject(reader.error);
    };
    fileReader.readAsText(file);
  });
}

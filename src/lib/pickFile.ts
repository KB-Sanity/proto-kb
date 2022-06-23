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

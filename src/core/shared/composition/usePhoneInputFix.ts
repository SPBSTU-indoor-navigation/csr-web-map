import { Ref } from "vue"

export function usePhoneInputFix(params: {
  inputText: Ref<string>,
  sourceElement: HTMLElement,
  delay?: number
}) {

  const { inputText, sourceElement, delay } = params

  if (delay === 0) {
    sourceElement.focus()
    sourceElement.click()
    return
  }

  const t = document.createElement('input');
  t.style.position = 'absolute';
  t.style.height = '20px';
  t.style.opacity = '0';
  t.enterKeyHint = "search"
  t.addEventListener('input', (e: any) => {
    inputText.value = e.target.value
  });

  document.body.appendChild(t);
  t.focus();

  setTimeout(() => {
    sourceElement.focus();
    sourceElement.click();

    document.body.removeChild(t);
  }, delay == undefined ? 500 : delay);
}

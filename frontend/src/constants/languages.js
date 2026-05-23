export const LANGUAGES = [
  {
    name: "JavaScript",
    monacoId: "javascript",
    fileExtension: "js",
  },
  {
    name: "Python",
    monacoId: "python",
    fileExtension: "py",
  },
  {
    name: "HTML",
    monacoId: "html",
    fileExtension: "html",
  },
  {
    name: "CSS",
    monacoId: "css",
    fileExtension: "css",
  },
  {
    name: "Java",
    monacoId: "java",
    fileExtension: "java",
  },
];

export const LANGUAGE_SAMPLES = {
  JavaScript: `const message = "Hello world";

function greet(name) {
  return message + ", " + name + "!";
}

console.log(greet("Wahid"));`,
  Python: `message = "Hello world"

def greet(name):
    return f"{message}, {name}!"

print(greet("Wahid"))`,
  HTML: `<button id="greeting-button">Say hello</button>
<p id="message"></p>

<script>
  const button = document.querySelector("#greeting-button");
  const message = document.querySelector("#message");

  button.addEventListener("click", () => {
    message.textContent = "Hello world";
  });
</script>`,
  CSS: `.button {
  background: #0f766e;
  border: 0;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  padding: 10px 14px;
}`,
  Java: `public class Main {
  public static void main(String[] args) {
    String message = "Hello world";
    System.out.println(message);
  }
}`,
};

export function getLanguageSample(languageName) {
  return LANGUAGE_SAMPLES[languageName] ?? LANGUAGE_SAMPLES.JavaScript;
}


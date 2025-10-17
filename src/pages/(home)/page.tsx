
export async function getStaticPath() { 
  return ["/"];
}

export default function HomePage() {
  return (
    <div>
      <h2>Welcome to the Home Page</h2>
      <p>This is the root of your app.</p>
    </div>
  );
}
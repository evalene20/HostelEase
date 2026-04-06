import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:5000")
      .then(res => res.text())
      .then(data => console.log(data));
  }, []);

  return (
    <div>
      <h1>Smart Hostel Management System</h1>
    </div>
  );
}

export default App;
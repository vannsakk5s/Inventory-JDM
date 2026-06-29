async function testAPI() {
  try {
    const res = await fetch("http://localhost:3000/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Test API Category",
        description: "Testing API"
      })
    })
    
    console.log("Status:", res.status)
    const text = await res.text()
    console.log("Response:", text)
  } catch(e) {
    console.error(e)
  }
}
testAPI()

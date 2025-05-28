# Backend Architecture Documentation
## System Overview
The frontend was developed using:

1. Next.js
2. Typescript
3. Tailwind css.

On entering the app the user arrives at the home page which contains a section explaining how the system works. From here the user can navigate to the verification page and choose to either take/upload a photo of a prescription or submit the url of an online review. Upon submission the user is presented with analysis of their submission explaining whether it is fraud and the reasoning behind it.

## Data processing

Data is handled using GET and POST requests to the backend flask server:

```ts
    const Submit = async () => {
        let payload = []

        if (current == "photo"){
        payload = ["image", image]
        }
        else if(current == "review"){
        payload = ["url", inputValue]
        }
        else{
        const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file!);
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
        });
        payload = ["image", base64];
    }
        const res = await fetch(ip, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: payload }),
    });

    const data = await res.json();
    console.log(data)
};

{
 localStorage.setItem('analysisData', JSON.stringify(minimalData));
      router.push(`/verify/analyse?source=local`);
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
}
```

The payload is in the form the backend expects being an array with the datas type and the data itself. The payload differs based on the type of data the user has selected. It can be seen that if the data is an captured image or url, it can just be sent to the server. However as the backend is expecting an image to be in the form of base-64 encoded image data, the uploaded file must first be converted before it can be sent through. Once the user submits the data a compressed version is cached in local storage so it can be processed.

```ts
if (source === "local") {
      try {
        const localData = localStorage.getItem('analysisData');
        if (localData) {
          setData(JSON.parse(localData));
          // Clean up after use
          localStorage.removeItem('analysisData');
        } else {
          throw new Error("No data found in localStorage");
        }
      } catch (e) {
        console.error("Error retrieving local data:", e);
        // Handle error
      }
    } else if (queryData) {
      try {
        setData(JSON.parse(queryData));
      } catch (e) {
        console.error("Error parsing data:", e);
        // Handle error
      }
    }
```
Each key value pair of the JSON recieved from the flask server are set to the data dictionary where confidence (100 - risk score) reasoning can be displayed on the UI. While waiting for the data to be processed and sent from the server to the frontend, the user will wait in a loading screen which ends once the data has been recieved.

##  Further Enhancements

1. Login and subscription feature:
    - Users can create an account where they can view all previous submissions
    - Premium Subscription allows users to use premium AI models

2. End to end encryption between client and server side.

3. Improved UI for a smoother user experience.


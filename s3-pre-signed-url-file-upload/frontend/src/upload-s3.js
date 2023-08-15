const lambdaUrl =
  "https://zz2lkos6iusx563fj75jktb3gi0nrqgt.lambda-url.us-west-2.on.aws/";

const uploadFile = async (e) => {
  e.preventDefault();

  const presignedPostResponse = await fetch(lambdaUrl);
  const { presignedPost } = await presignedPostResponse.json();
  console.log("presignedPost", presignedPost);

  let form = new FormData();

  Object.keys(presignedPost.fields).forEach((key) => {
    form.append(key, presignedPost.fields[key]);
  });

  // File must be last field in the form
  form.append("file", document.querySelector("#upload-input").files[0]);

  const uploadResponse = await fetch(presignedPost.url, {
    method: "POST",
    body: form,
  });

  if (uploadResponse.status === 204) {
    console.log(uploadResponse);
  } else {
    console.log("ERROR,upload failed!");
  }
};

document.querySelector("#upload-button").addEventListener("click", uploadFile);

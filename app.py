from google.cloud import aiplatform
from flask import Flask, render_template, request

app = Flask(
    __name__, 
    static_folder="build/static", 
    template_folder="build"
)
aiplatform.init(
    project="brazen-score",
    location="us-central1"
)

@app.route("/")
def serve():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    endpoint = aiplatform.Endpoint("projects/33769752758/locations/us-central1/endpoints/5056865082374356992")

    data = request.get_json()
    abc_score = data["abc_score"].replace("\n", "\\n")
    assert type(abc_score) == str, "abc_score must be a string"
    instances = [{"score": abc_score}]

    response = endpoint.predict(instances=instances)
    return {"prediction": response.predictions[0]}

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=5000)

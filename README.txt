# Mental Health Score UI

## Files
- `index.html` — page structure and all StudentData input fields
- `style.css` — dark/glowing UI, responsive layout and animations
- `script.js` — Fetch API request, loading state, validation/API error handling and result display

## Run the FastAPI backend
From your backend folder:

```bash
uvicorn main:app --reload
```

The frontend expects:

```text
POST http://127.0.0.1:8000/predict
```

## Run the frontend
The simplest option is VS Code Live Server, or any local static web server.

Example with Python:

```bash
python -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500
```

The FastAPI CORS configuration in your code already allows the frontend to make the request.

## Important
Your backend currently returns a rounded score:

```python
round(float(prediction))
```

so the UI will receive an integer score even though `PredictionResponse` declares the field as `float`.

Also, the frontend's circular ring is a visual animation only; it does not assume a specific clinical score range.

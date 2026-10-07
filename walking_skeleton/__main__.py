"""Start the local UC.1 HTTP demonstration: python -m walking_skeleton."""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("walking_skeleton.backend.main:app", host="127.0.0.1", port=8765)

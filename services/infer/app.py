from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import cv2
import numpy as np
import requests
import tempfile
import os
from pathlib import Path

app = FastAPI(title="Biomechanics Analysis API", version="0.1.0")

class AnalyzeRequest(BaseModel):
    video_url: str
    phases: List[str] = ["setup", "pull", "transition", "receive", "recovery"]
    focus: Optional[List[str]] = None

class AnalyzeResponse(BaseModel):
    overview: str
    phases: Dict[str, Any]
    recommendations: List[str]
    debug: Dict[str, Any] = {}

class FrameRequest(BaseModel):
    video_url: str
    ms: int

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "biomechanics-inference"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_biomechanics(req: AnalyzeRequest):
    """
    Analyze biomechanics from video URL and return structured coaching feedback.
    This is a defensive sports analysis tool for coaching purposes.
    """
    try:
        # Download and analyze video
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_file:
            # Download video
            response = requests.get(req.video_url, stream=True)
            response.raise_for_status()
            
            for chunk in response.iter_content(chunk_size=8192):
                tmp_file.write(chunk)
            
            video_path = tmp_file.name
        
        # Analyze video with OpenCV (placeholder for actual pose estimation)
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_ms = (frame_count / fps) * 1000 if fps > 0 else 0
        
        # Mock analysis results (replace with actual pose estimation)
        analysis_result = _mock_biomechanics_analysis(req.phases, req.focus, duration_ms)
        
        cap.release()
        os.unlink(video_path)  # Clean up temp file
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/frame")
async def extract_frame(req: FrameRequest):
    """Extract a specific frame from video at given timestamp."""
    try:
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_file:
            response = requests.get(req.video_url, stream=True)
            response.raise_for_status()
            
            for chunk in response.iter_content(chunk_size=8192):
                tmp_file.write(chunk)
            
            video_path = tmp_file.name
        
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Seek to specific timestamp
        frame_number = int((req.ms / 1000.0) * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        
        ret, frame = cap.read()
        if not ret:
            raise HTTPException(status_code=400, detail="Could not extract frame at specified timestamp")
        
        # Save frame temporarily and return info
        frame_path = f"/tmp/frame_{req.ms}ms.jpg"
        cv2.imwrite(frame_path, frame)
        
        cap.release()
        os.unlink(video_path)
        
        return {
            "timestamp_ms": req.ms,
            "frame_path": frame_path,
            "message": f"Frame extracted at {req.ms}ms"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame extraction failed: {str(e)}")

def _mock_biomechanics_analysis(phases: List[str], focus: Optional[List[str]], duration_ms: float) -> AnalyzeResponse:
    """
    Mock biomechanics analysis. Replace this with actual pose estimation and analysis.
    This could integrate MediaPipe, OpenPose, or custom ONNX models.
    """
    
    # Simulate analysis based on phases
    phase_analysis = {}
    
    for phase in phases:
        if phase == "setup":
            phase_analysis[phase] = {
                "notes": "Stable base, neutral spine position",
                "timing": {"start_ms": 0, "end_ms": duration_ms * 0.15},
                "key_points": ["foot placement", "grip width", "starting position"]
            }
        elif phase == "pull":
            phase_analysis[phase] = {
                "notes": "Good initial drive, slight forward drift detected",
                "timing": {"start_ms": duration_ms * 0.15, "end_ms": duration_ms * 0.45},
                "angles": {"hip": 145, "knee": 120, "ankle": 85},
                "bar_path": "slightly forward"
            }
        elif phase == "transition":
            phase_analysis[phase] = {
                "notes": "Quick under-bar movement, good timing",
                "timing": {"start_ms": duration_ms * 0.45, "end_ms": duration_ms * 0.6},
                "key_points": ["turnover speed", "elbow position"]
            }
        elif phase == "receive":
            phase_analysis[phase] = {
                "notes": "Solid catch position, stable front rack",
                "timing": {"start_ms": duration_ms * 0.6, "end_ms": duration_ms * 0.85},
                "depth": "full squat",
                "stability": "good"
            }
        elif phase == "recovery":
            phase_analysis[phase] = {
                "notes": "Controlled stand, maintained front rack position",
                "timing": {"start_ms": duration_ms * 0.85, "end_ms": duration_ms},
                "key_points": ["knee drive", "core stability"]
            }
    
    # Generate focus-specific insights
    focus_insights = []
    if focus:
        for area in focus:
            if area == "bar path":
                focus_insights.append("Bar drifts 2-3cm forward during second pull")
            elif area == "receive":
                focus_insights.append("Catch position shows good mobility and timing")
    
    # Generate recommendations
    recommendations = [
        "Focus on keeping bar closer during second pull - practice tall cleans",
        "Work on lat engagement to prevent forward drift",
        "Continue front squat mobility work for deeper receiving position",
        "Add pause cleans to improve turnover timing"
    ]
    
    # Add focus-specific recommendations
    if focus and "bar path" in focus:
        recommendations.insert(0, "Priority: Fix bar path with sweep drills and lat activation")
    
    overview = "Technical clean with good timing. Main area for improvement: bar path during second pull. Strong receiving position and recovery."
    
    return AnalyzeResponse(
        overview=overview,
        phases=phase_analysis,
        recommendations=recommendations,
        debug={
            "duration_ms": duration_ms,
            "analysis_version": "0.1.0",
            "model": "mock_analysis",
            "focus_areas": focus or []
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
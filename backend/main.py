from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
import auth
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SELF-CONTAINED SCHEMAS ---
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TaskCreate(BaseModel):
    title: str
    status: str
    priority: str
    assigned_to: str
    project: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# --- ROUTES ---
@app.get("/")
def home():
    return {"message": "Backend Running Successfully"}

def get_current_user(authorization: str, db: Session):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token missing")
    token = authorization.split(" ")[1]
    username = auth.verify_token(token)
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid User")
    return user

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        return {"success": False, "message": "Username already exists"}
        
    hashed_password = auth.hash_password(user.password)
    
    # THE DEMO TRICK: Auto-assign 'Admin' role if 'admin' is in the username!
    role = "Admin" if "admin" in user.username.lower() else "Member"
    
    new_user = models.User(username=user.username, password=hashed_password, role=role)
    db.add(new_user)
    db.commit()
    return {"success": True, "message": f"Registered Successfully as {role}"}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user:
        return {"success": False, "message": "Invalid Username"}
    valid_password = auth.verify_password(user.password, db_user.password)
    if not valid_password:
        return {"success": False, "message": "Invalid Password"}
        
    token = auth.create_access_token(data={"sub": db_user.username})
    return {"success": True, "access_token": token, "token_type": "bearer", "role": db_user.role}

@app.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.put("/users/password")
def change_password(passwords: PasswordChange, authorization: str = Header(None), db: Session = Depends(get_db)):
    user = get_current_user(authorization, db)
    if not auth.verify_password(passwords.current_password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    user.password = auth.hash_password(passwords.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@app.get("/tasks")
def get_tasks(authorization: str = Header(None), db: Session = Depends(get_db)):
    user = get_current_user(authorization, db)
    # ROLE-BASED ACCESS: Admins see everything. Members see only their assigned tasks.
    if user.role == "Admin":
        return db.query(models.Task).all()
    else:
        return db.query(models.Task).filter(models.Task.assigned_to == user.username).all()

@app.post("/tasks")
def create_task(task: TaskCreate, authorization: str = Header(None), db: Session = Depends(get_db)):
    user = get_current_user(authorization, db)
    new_task = models.Task(
        title=task.title,
        status=task.status,
        priority=task.priority,
        assigned_to=task.assigned_to,
        project=task.project,
        owner_id=user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"message": "Task Created Successfully", "task": new_task}

@app.put("/tasks/{task_id}")
def update_task(task_id: int, authorization: str = Header(None), db: Session = Depends(get_db)):
    user = get_current_user(authorization, db)
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404)
        
    # Security: Only Admins or the Assigned Member can complete the task
    if user.role == "Admin" or task.assigned_to == user.username:
        task.status = "Completed"
        db.commit()
        return {"message": "Task Updated"}
    raise HTTPException(status_code=403, detail="Not authorized")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, authorization: str = Header(None), db: Session = Depends(get_db)):
    user = get_current_user(authorization, db)
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404)
        
    # Security: ONLY Admins can delete tasks
    if user.role == "Admin":
        db.delete(task)
        db.commit()
        return {"message": "Task Deleted"}
    raise HTTPException(status_code=403, detail="Permission Denied: Only Admins can delete tasks")
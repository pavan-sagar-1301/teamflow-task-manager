from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="Member")  # ADDED: Admin or Member role

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    status = Column(String, default="Pending")
    priority = Column(String, default="Medium")
    assigned_to = Column(String)  # ADDED: Who the task is assigned to
    project = Column(String, default="General")  # ADDED: Project grouping
    owner_id = Column(Integer, ForeignKey("users.id"))
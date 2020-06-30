import bpy
import random
from math import radians

ob = bpy.data.objects["star"]
ob.rotation_mode = 'XYZ'
frame_no = 0 

bpy.context.scene.frame_set(frame_no)
bpy.context.scene.frame_set(frame_no)
ob.location = (0,0,0)
ob.keyframe_insert(data_path="location", index=-1)
ob.rotation_euler = (0,0,0)
ob.keyframe_insert(data_path="rotation_euler", index=-1)
frame_no+=20 

for i in range(0,11):
    x = random.uniform(-1,1)
    y = random.uniform(-1,1)
    z = random.uniform(-1,1)
    xr = radians(random.uniform(-20,20))
    yr = radians(random.uniform(-20,20))
    zr = radians(random.uniform(-20,20))
    bpy.context.scene.frame_set(frame_no)
    ob.location = (x,y,z)
    ob.keyframe_insert(data_path="location", index=-1)
    ob.rotation_euler = (xr,yr,zr)
    ob.keyframe_insert(data_path="rotation_euler", index=-1)
    frame_no+=20
    
bpy.context.scene.frame_set(frame_no)
ob.location = (0,0,0)
ob.keyframe_insert(data_path="location", index=-1)
ob.rotation_euler = (0,0,0)
ob.keyframe_insert(data_path="rotation_euler", index=-1)
frame_no+=20
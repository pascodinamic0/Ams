#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Render a publication-quality ShuleOS system tree map to SVG, PNG, and PDF."""

from __future__ import annotations

import textwrap
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import A2, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas as pdf_canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "Docs"
SVG_PATH = OUT / "school-management-system-tree.svg"
PNG_PATH = OUT / "school-management-system-tree.png"
PDF_PATH = OUT / "school-management-system-tree.pdf"

TREE: dict[str, list[str]] = {
    "ShuleOS\nSchool Management System": [
        "Authentication & Access",
        "Public Website",
        "Super Admin",
        "Academic Module",
        "Finance Module",
        "Operations Module",
        "Teacher Portal",
        "Parent Portal",
        "Student Portal",
        "Analytics",
        "Communication",
        "Settings & Onboarding",
        "Backend & Data",
    ],
    "Authentication & Access": [
        "Login", "Register", "Forgot Password", "Reset Password", "Role-Based Access", "Auth Callback",
    ],
    "Public Website": [
        "Homepage", "Features", "Modules", "Contact", "Online Admissions", "Public Events", "School Pages",
    ],
    "Super Admin": [
        "Dashboard", "Schools", "Branches", "Users", "Roles & Permissions", "Audit Logs", "Feature Flags",
    ],
    "Academic Module": [
        "Students", "Guardians", "Admissions", "Classes", "Sections", "Subjects",
        "Timetable", "Curriculum", "Attendance", "Grades", "Report Cards", "Academic Team",
    ],
    "Finance Module": [
        "Fee Structure", "Invoices", "Payments", "Payroll", "Expenses", "Finance Reports", "Fee Reminders",
    ],
    "Operations Module": ["Library", "Transport", "Events", "Staff", "Operations Dashboard"],
    "Teacher Portal": [
        "My Classes", "Attendance", "Gradebook", "Assignments", "Exams", "Report Cards", "Messages",
    ],
    "Parent Portal": [
        "Fees", "Payments", "Timetable", "Assignments", "Events", "Transport", "Performance", "Messages",
    ],
    "Student Portal": ["Timetable", "Assignments", "Grades", "Library", "Events", "Messages"],
    "Analytics": ["Students Analytics", "Attendance Analytics", "Finance Analytics", "Branch Comparison"],
    "Communication": ["Messaging", "Notifications", "Outreach Campaigns"],
    "Settings & Onboarding": ["User Settings", "School Setup Guide", "Profile Onboarding", "System Preferences"],
    "Backend & Data": [
        "Server Actions", "API Routes", "Database Layer", "Auth Services",
        "Supabase Migrations", "Cron Jobs", "Webhooks", "PWA / Offline",
    ],
}

COLORS: dict[str, tuple[str, str, str]] = {
    "Authentication & Access": ("#eef2ff", "#6366f1", "#312e81"),
    "Public Website": ("#fffbeb", "#f59e0b", "#92400e"),
    "Super Admin": ("#fef2f2", "#ef4444", "#991b1b"),
    "Academic Module": ("#eff6ff", "#3b82f6", "#1e40af"),
    "Finance Module": ("#ecfdf5", "#10b981", "#065f46"),
    "Operations Module": ("#f8fafc", "#64748b", "#334155"),
    "Teacher Portal": ("#f5f3ff", "#8b5cf6", "#5b21b6"),
    "Parent Portal": ("#fdf2f8", "#ec4899", "#9d174d"),
    "Student Portal": ("#f0f9ff", "#0ea5e9", "#075985"),
    "Analytics": ("#f0fdfa", "#14b8a6", "#115e59"),
    "Communication": ("#fff7ed", "#f97316", "#9a3412"),
    "Settings & Onboarding": ("#faf5ff", "#a855f7", "#6b21a8"),
    "Backend & Data": ("#f1f5f9", "#475569", "#334155"),
}

ROOT_STYLE = ("#0f172a", "#0f172a", "#ffffff")
LEAF_STYLE = ("#ffffff", "#cbd5e1", "#1e293b")


@dataclass
class Node:
    label: str
    children: list[Node] = field(default_factory=list)
    x: float = 0.0
    y: float = 0.0
    w: float = 0.0
    h: float = 0.0
    depth: int = 0
    style_key: str = ""
    box: tuple[float, float, float, float] | None = None


def build(label: str, depth: int = 0, style_key: str | None = None) -> Node:
    key = style_key or (label if depth == 1 else style_key or "")
    node = Node(label=label, depth=depth, style_key=key if depth <= 1 else style_key or key)
    for child in TREE.get(label, []):
        node.children.append(build(child, depth + 1, node.style_key if depth >= 1 else child))
    return node


def style_for(node: Node) -> tuple[str, str, str]:
    if node.depth == 0:
        return ROOT_STYLE
    if node.depth == 1:
        return COLORS.get(node.label, LEAF_STYLE)
    return LEAF_STYLE


def measure(label: str, font_size: int, max_width: int = 180) -> tuple[int, int]:
    lines: list[str] = []
    for part in label.split("\n"):
        if len(part) <= 22:
            lines.append(part)
        else:
            lines.extend(textwrap.wrap(part, width=22))
    char_w = font_size * 0.58
    char_h = font_size * 1.35
    w = min(max_width, max(int(max(len(l) for l in lines) * char_w) + 24, 88))
    h = int(len(lines) * char_h) + 18
    return w, h


def layout(node: Node, x: float, y: float, gap_x: float, gap_y: float) -> float:
    fs = 20 if node.depth == 0 else 15 if node.depth == 1 else 12
    w, h = measure(node.label, fs)
    node.w, node.h = w, h
    node.y = y
    if not node.children:
        node.x = x + w / 2
        return w
    child_ws: list[float] = []
    cx = x
    child_y = y + h + gap_y
    for child in node.children:
        cw = layout(child, cx, child_y, gap_x, gap_y)
        child_ws.append(cw)
        cx += cw + gap_x
    total = sum(child_ws) + gap_x * (len(node.children) - 1)
    node.x = x + total / 2
    return max(w, total)


def all_nodes(node: Node) -> list[Node]:
    out = [node]
    for c in node.children:
        out.extend(all_nodes(c))
    return out


def connector_path(px: float, py2: float, cx: float, cy1: float) -> str:
    mid = (py2 + cy1) / 2
    return f"M {px:.1f},{py2:.1f} L {px:.1f},{mid:.1f} L {cx:.1f},{mid:.1f} L {cx:.1f},{cy1:.1f}"


def write_svg(tree: Node, nodes: list[Node], width: int, height: int) -> None:
    svg = ET.Element(
        "svg",
        xmlns="http://www.w3.org/2000/svg",
        width=str(width),
        height=str(height),
        viewBox=f"0 0 {width} {height}",
    )
    defs = ET.SubElement(svg, "defs")
    shadow = ET.SubElement(defs, "filter", id="shadow", x="-20%", y="-20%", width="140%", height="140%")
    ET.SubElement(shadow, "feDropShadow", dx="0", dy="2", stdDeviation="3", flood_color="#000000", flood_opacity="0.12")

    bg = ET.SubElement(svg, "rect", width=str(width), height=str(height), fill="#f8fafc")
    header = ET.SubElement(svg, "rect", x="0", y="0", width=str(width), height="96", fill="#0f172a")
    ET.SubElement(svg, "text", x=str(width / 2), y="42", fill="#ffffff", **{
        "font-family": "Inter, Segoe UI, Arial, sans-serif",
        "font-size": "30",
        "font-weight": "700",
        "text-anchor": "middle",
    }).text = "ShuleOS - Complete School Management System Tree"
    ET.SubElement(svg, "text", x=str(width / 2), y="72", fill="#cbd5e1", **{
        "font-family": "Inter, Segoe UI, Arial, sans-serif",
        "font-size": "15",
        "text-anchor": "middle",
    }).text = "Modules, portals, roles, and backend layers"

    g_links = ET.SubElement(svg, "g", stroke="#94a3b8", **{"stroke-width": "2", "fill": "none"})
    for n in nodes:
        if not n.children or n.box is None:
            continue
        _, y1, _, y2 = n.box
        px = n.x
        for c in n.children:
            if c.box is None:
                continue
            cx, cy1, _, _ = c.box
            path = ET.SubElement(g_links, "path", d=connector_path(px, y2, cx, cy1))

    for n in nodes:
        if n.box is None:
            continue
        x1, y1, x2, y2 = n.box
        fill, stroke, text = style_for(n)
        rx = "14" if n.depth <= 1 else "8"
        rect = ET.SubElement(
            svg, "rect", x=f"{x1:.1f}", y=f"{y1:.1f}", width=f"{x2-x1:.1f}", height=f"{y2-y1:.1f}",
            rx=rx, ry=rx, fill=fill, stroke=stroke, **{"stroke-width": "2" if n.depth <= 1 else "1", "filter": "url(#shadow)"},
        )
        fs = 20 if n.depth == 0 else 15 if n.depth == 1 else 12
        weight = "700" if n.depth <= 1 else "500"
        ty = y1 + 16
        for line in n.label.split("\n"):
            t = ET.SubElement(svg, "text", x=f"{n.x:.1f}", y=f"{ty:.1f}", fill=text, **{
                "font-family": "Inter, Segoe UI, Arial, sans-serif",
                "font-size": str(fs),
                "font-weight": weight,
                "text-anchor": "middle",
            })
            t.text = line
            ty += fs * 1.35

    ET.ElementTree(svg).write(SVG_PATH, encoding="utf-8", xml_declaration=True)


def assign_boxes(node: Node) -> None:
    x1 = node.x - node.w / 2
    y1 = node.y
    node.box = (x1, y1, x1 + node.w, y1 + node.h)
    for c in node.children:
        assign_boxes(c)


def rasterize(nodes: list[Node], width: int, height: int) -> Image.Image:
    try:
        title_f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 28)
        branch_f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 14)
        leaf_f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 11)
        sub_f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
    except OSError:
        title_f = branch_f = leaf_f = sub_f = ImageFont.load_default()

    img = Image.new("RGB", (width, height), "#f8fafc")
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, width, 96], fill="#0f172a")
    title = "ShuleOS - Complete School Management System Tree"
    bbox = draw.textbbox((0, 0), title, font=title_f)
    draw.text(((width - (bbox[2] - bbox[0])) / 2, 24), title, fill="#ffffff", font=title_f)
    sub = "Modules, portals, roles, and backend layers"
    sb = draw.textbbox((0, 0), sub, font=sub_f)
    draw.text(((width - (sb[2] - sb[0])) / 2, 58), sub, fill="#cbd5e1", font=sub_f)

    for n in nodes:
        if not n.children or n.box is None:
            continue
        _, y1, _, y2 = n.box
        px, py2 = n.x, y2
        for c in n.children:
            if c.box is None:
                continue
            cx, cy1, _, _ = c.box
            mid = (py2 + cy1) / 2
            stroke = style_for(c)[1]
            draw.line([(px, py2), (px, mid), (cx, mid), (cx, cy1)], fill=stroke, width=2)

    for n in nodes:
        if n.box is None:
            continue
        x1, y1, x2, y2 = n.box
        fill, stroke, text = style_for(n)
        r = 14 if n.depth <= 1 else 8
        draw.rounded_rectangle([x1, y1, x2, y2], radius=r, fill=fill, outline=stroke, width=2 if n.depth <= 1 else 1)
        font = title_f if n.depth == 0 else branch_f if n.depth == 1 else leaf_f
        lines = n.label.split("\n")
        ty = y1 + 12
        for line in lines:
            bb = draw.textbbox((0, 0), line, font=font)
            tw = bb[2] - bb[0]
            draw.text((n.x - tw / 2, ty), line, fill=text, font=font)
            ty += (bb[3] - bb[1]) + 3

    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    tree = build("ShuleOS\nSchool Management System")
    layout(tree, 80, 130, 18, 72)
    nodes = all_nodes(tree)
    assign_boxes(tree)

    min_x = min(n.box[0] for n in nodes if n.box) - 60
    max_x = max(n.box[2] for n in nodes if n.box) + 60
    max_y = max(n.box[3] for n in nodes if n.box) + 80
    width = int(max(3600, max_x - min_x + 120))
    height = int(max(2200, max_y + 40))
    offset = width / 2 - (max_x + min_x) / 2
    for n in nodes:
        n.x += offset
        if n.box:
            x1, y1, x2, y2 = n.box
            n.box = (x1 + offset, y1, x2 + offset, y2)

    write_svg(tree, nodes, width, height)
    img = rasterize(nodes, width, height)
    img.save(PNG_PATH, optimize=True)

    pw, ph = landscape(A2)
    c = pdf_canvas.Canvas(str(PDF_PATH), pagesize=(pw, ph))
    margin = 18
    aw, ah = pw - margin * 2, ph - margin * 2
    ratio = width / height
    pr = aw / ah
    if ratio > pr:
        dw, dh = aw, aw / ratio
    else:
        dh, dw = ah, ah * ratio
    c.drawImage(ImageReader(PNG_PATH), (pw - dw) / 2, (ph - dh) / 2, width=dw, height=dh, preserveAspectRatio=True, mask="auto")
    c.save()

    print(f"Created: {SVG_PATH}")
    print(f"Created: {PNG_PATH}")
    print(f"Created: {PDF_PATH}")


if __name__ == "__main__":
    main()

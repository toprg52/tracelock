from langgraph.graph import StateGraph, END
from .state import GraphState
from .nodes import (
    deobfuscation, mitre_mapping, network_intel,
    grc_compliance, risk_scoring, report_generation,
)

def build_graph():
    g = StateGraph(GraphState)
    g.add_node("deobfuscation", deobfuscation.run)
    g.add_node("network_intel", network_intel.run)
    g.add_node("mitre_mapping", mitre_mapping.run)
    g.add_node("grc_compliance", grc_compliance.run)
    g.add_node("risk_scoring", risk_scoring.run)
    g.add_node("report_generation", report_generation.run)

    g.set_entry_point("deobfuscation")
    g.add_edge("deobfuscation", "network_intel")   # parallelizable later
    g.add_edge("network_intel", "mitre_mapping")
    g.add_edge("mitre_mapping", "grc_compliance")
    g.add_edge("grc_compliance", "risk_scoring")
    g.add_edge("risk_scoring", "report_generation")
    g.add_edge("report_generation", END)
    return g.compile()

compiled_graph = build_graph()
